export type BootstrapMenuAction = {
    name: string | ((data: any) => string);
    iconClass?: string;
    classNames?: string | ((data: any) => string);
    isShown?: (data: any) => Promise<boolean> | boolean;
    isEnabled?: (data: any) => Promise<boolean> | boolean;
    onClick: (data: any) => Promise<void> | void;
};

export type BootstrapMenuOptions = {
    container?: HTMLElement | string;
    fetchElementData?: (el: HTMLElement) => Promise<any> | any;
    menuSource?: 'mouse' | 'element';
    menuPosition?: 'aboveLeft' | 'aboveRight' | 'belowLeft' | 'belowRight';
    menuEvent?: 'click' | 'right-click' | 'hover';
    actionsGroups?: string[][];
    actions: Record<string, BootstrapMenuAction>;
    noActionsMessage?: string;
    _actionSelectEvent?: 'click' | 'mousedown';
};

const defaultOptions: BootstrapMenuOptions = {
    container: 'body',
    fetchElementData: () => undefined,
    menuSource: 'mouse',
    menuPosition: 'belowLeft',
    menuEvent: 'right-click',
    actionsGroups: [],
    actions: {},
    noActionsMessage: 'Sem ações disponíveis',
    _actionSelectEvent: 'click',
};

function uniqueId(prefix = ''): string {
    return prefix + Math.random().toString(36).substr(2, 9);
}

function renderMenu(menu: BootstrapMenu): HTMLElement {
    const menuDiv = document.createElement('div');
    menuDiv.className = 'dropdown bootstrapMenu';
    menuDiv.style.zIndex = '10000';
    menuDiv.style.position = 'absolute';
    menuDiv.style.display = 'none';

    const ul = document.createElement('ul');
    ul.className = 'dropdown-menu';
    ul.style.position = 'static';
    ul.style.display = 'block';
    ul.style.fontSize = '0.9em';

    let actionsHaveIcon = false;

    // Cria cada ação como <li data-action>
    Object.entries(menu.options.actions).forEach(([actionId, action]) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.dataset.action = actionId;

        const button = document.createElement('button');
        button.setAttribute('role', 'menuitem');
        button.classList.add('dropdown-item');
        button.type = 'button';

        if (action.iconClass) {
            actionsHaveIcon = true;
            const i = document.createElement('i');
            i.className = `bi bi-${action.iconClass} pe-1`;
            button.appendChild(i);
            button.appendChild(document.createTextNode(' '));
        }

        const span = document.createElement('span');
        span.className = 'actionName';
        span.textContent = typeof action.name === 'function' ? '' : action.name; // será atualizado no open
        button.appendChild(span);

        li.appendChild(button);
        ul.appendChild(li);
    });

    // No actions message
    const noActionsLi = document.createElement('li');
    noActionsLi.setAttribute('role', 'presentation');
    noActionsLi.className = 'noActionsMessage disabled';
    const noActionsButton = document.createElement('button');
    noActionsButton.setAttribute('role', 'menuitem');
    noActionsButton.classList.add('dropdown-item');
    noActionsButton.disabled = true;
    const noActionsSpan = document.createElement('span');
    noActionsSpan.textContent = menu.options.noActionsMessage || 'No available actions';
    noActionsButton.appendChild(noActionsSpan);
    noActionsLi.appendChild(noActionsButton);
    ul.appendChild(noActionsLi);

    menuDiv.appendChild(ul);
    return menuDiv;
}


class BootstrapMenu {
    static existingInstances: BootstrapMenu[] = [];
    selector: string;
    options: BootstrapMenuOptions;
    namespace: string;
    closeNamespace: string;
    container!: HTMLElement;
    menu!: HTMLElement;
    menuList!: HTMLElement;
    openTarget: HTMLElement | null = null;
    openEvent: MouseEvent | null = null;

    constructor(selector: string, options: Partial<BootstrapMenuOptions>) {
        this.selector = selector;
        this.options = { ...defaultOptions, ...options };
        this.namespace = uniqueId('.BootstrapMenu_');
        this.closeNamespace = uniqueId('.BootstrapMenuClose_');
        this.init();
    }

    init() {
        this.container = typeof this.options.container === 'string'
            ? document.querySelector(this.options.container) as HTMLElement
            : this.options.container as HTMLElement;
        this.menu = renderMenu(this);
        this.menuList = this.menu.querySelector('ul')!;
        this.menu.style.display = 'none';
        this.container.appendChild(this.menu);
        this.openTarget = null;
        this.openEvent = null;
        this.setupOpenEventListeners();
        this.setupActionsEventListeners();
        BootstrapMenu.existingInstances.push(this);
    }

    setupOpenEventListeners() {
        let openEventName: string;
        switch (this.options.menuEvent) {
            case 'click': openEventName = 'click'; break;
            case 'right-click': openEventName = 'contextmenu'; break;
            case 'hover': openEventName = 'mouseenter'; break;
            default: throw new Error("Unknown BootstrapMenu 'menuEvent' option");
        }
        this.container.addEventListener(openEventName, async (evt) => {
            const target = evt.target as HTMLElement;
            const matched = target.closest(this.selector);
            if (!matched || !(this.container.contains(matched))) return;
            await this.open(matched as HTMLElement, evt as MouseEvent);
            evt.preventDefault();
            evt.stopPropagation();
        });
    }

    clearOpenEventListeners() {
        // Not implemented: would require tracking listeners for removal
    }

    setupActionsEventListeners() {
        const eventType = this.options._actionSelectEvent || 'click';
        this.menu.addEventListener(eventType, async (evt) => {
            const target = evt.target as HTMLElement;
            const actionLi = target.closest('[data-action]') as HTMLElement;
            if (!actionLi || actionLi.classList.contains('disabled')) return;
            const actionId = actionLi.dataset.action!;
            const data = await this.options.fetchElementData?.(this.openTarget!);
            await this.options.actions[actionId]!.onClick(data);
            this.close();
            evt.preventDefault();
            evt.stopPropagation();
        });
    }

    clearActionsEventListeners() {
        // Not implemented: would require tracking listeners for removal
    }

    setupCloseEventListeners() {
        if (this.options.menuEvent === 'hover') {
            const leaveHandler = (evt: MouseEvent) => {
                const dest = evt.relatedTarget as HTMLElement;
                if (dest !== this.openTarget && dest !== this.menu) {
                    this.menu.removeEventListener('mouseleave', leaveHandler);
                    this.openTarget?.removeEventListener('mouseleave', leaveHandler);
                    this.close();
                }
            };
            this.menu.addEventListener('mouseleave', leaveHandler);
            this.openTarget?.addEventListener('mouseleave', leaveHandler);
        }
        document.addEventListener('click', this._closeOnOutsideClick);
    }

    clearCloseEventListeners() {
        document.removeEventListener('click', this._closeOnOutsideClick);
    }

    _closeOnOutsideClick = (evt: MouseEvent) => {
        if (!this.menu.contains(evt.target as Node)) {
            this.close();
        }
    };

    updatePosition() {
  const menu = this.menu;
  const evt = this.openEvent;
  const target = this.openTarget;
  const { menuSource } = this.options;

  if (!menu) return;

  // Primeiro, definimos posição inicial aproximada
  let x = 0, y = 0;

  if (menuSource === 'element' && target) {
    const rect = target.getBoundingClientRect();
    x = rect.left;
    y = rect.bottom;
  } else if (menuSource === 'mouse' && evt) {
    x = evt.clientX;
    y = evt.clientY;
  }

  // Exibe temporariamente para calcular tamanho real
  menu.style.display = 'block';
  menu.style.visibility = 'hidden';
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;
  menu.style.visibility = '';

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 🔹 Ajuste horizontal
  // Se o menu ultrapassar a direita, "vira" para a esquerda
  if (x + menuWidth > viewportWidth) {
    x = Math.max(5, viewportWidth - menuWidth - 5);
  }

  // 🔹 Ajuste vertical
  // Se o menu ultrapassar a parte de baixo, "vira" para cima
  if (y + menuHeight > viewportHeight) {
    // se tiver vindo de elemento, posiciona acima do elemento
    if (menuSource === 'element' && target) {
      const rect = target.getBoundingClientRect();
      y = rect.top - menuHeight;
    } else {
      y = Math.max(5, viewportHeight - menuHeight - 5);
    }
  }

  // 🔹 Garante que nunca vá pra coordenadas negativas
  if (x < 0) x = 5;
  if (y < 0) y = 5;

  // 🔹 Aplica coordenadas finais
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.position = 'fixed'; // usa posição relativa à viewport
}


async open(target: HTMLElement, event: MouseEvent) {
    BootstrapMenu.closeAll();
    this.openTarget = target;
    this.openEvent = event;
    const data = await this.options.fetchElementData?.(this.openTarget);

    const actionLis = Array.from(this.menu.querySelectorAll('[data-action]')) as HTMLElement[];
    let numShown = 0;

    // Determina quais ações devem aparecer
    for (const li of actionLis) {
        const actionId = li.dataset.action!;
        const action = this.options.actions[actionId]!;

        let show = true;
        if (action.isShown) show = await action.isShown(data);
        li.style.display = show ? '' : 'none';
        if (show) numShown++;

        const nameSpan = li.querySelector('.actionName') as HTMLElement;
        nameSpan.textContent = typeof action.name === 'function' ? action.name(data) : action.name;

        const button = li.querySelector('.dropdown-item') as HTMLElement;
        if (action.isEnabled) {
            const enabled = await action.isEnabled(data);
            li.classList.toggle('disabled', !enabled);
            button.classList.toggle('disabled', !enabled);
        }

        if (action.classNames) {
            const classes = typeof action.classNames === 'function' ? action.classNames(data) : action.classNames;
            li.className = `${li.className} ${classes}`;
        }
    }

    // Remove dividers antigos
    this.menu.querySelectorAll('.dropdown-divider').forEach(div => div.remove());

    // Monta os grupos incluindo o grupo 0 (ações sem grupo)
    const groups: string[][] = [];
    groups[0] = []; // grupo 0 = ações sem grupo
    const definedGroups = this.options.actionsGroups || [];
    definedGroups.forEach((g, i) => groups[i + 1] = g.slice());

    // Preenche grupo 0 com ações não presentes em nenhum grupo
    const allGrouped = new Set(definedGroups.flat());
    Object.keys(this.options.actions).forEach(id => {
        if (!allGrouped.has(id)) groups[0]!.push(id);
    });

    // Adiciona dividers dinamicamente entre grupos visíveis
    let firstDividerInserted = false;
    for (const group of groups) {
        const visibleInGroup = group
            .map(id => this.menu.querySelector(`[data-action="${id}"]`) as HTMLElement)
            .filter(li => li && li.style.display !== 'none');

        if (visibleInGroup.length > 0) {
            if (firstDividerInserted) {
                const divider = document.createElement('li');
                divider.className = 'dropdown-divider';
                visibleInGroup[0]!.parentNode!.insertBefore(divider, visibleInGroup[0]!);
            }
            firstDividerInserted = true;
        }
    }

    // No actions message
    const noActionsMsg = this.menu.querySelector('.noActionsMessage') as HTMLElement;
    if (noActionsMsg) noActionsMsg.style.display = numShown === 0 ? '' : 'none';

    this.updatePosition();
    this.menu.style.display = 'block';
    this.setupCloseEventListeners();
}


    close() {
        this.menu.style.display = 'none';
        this.clearCloseEventListeners();
    }

    destroy() {
        this.close();
        this.clearOpenEventListeners();
        this.clearActionsEventListeners();
        if (this.menu.parentNode) this.menu.parentNode.removeChild(this.menu);
    }

    static closeAll() {
        BootstrapMenu.existingInstances.forEach((menu) => menu.close());
    }
}

export default BootstrapMenu;