<script setup lang="ts">
import type { Task } from '~/models/Task';
import { useTasksStore } from '~/stores/tasks.store';



const newTaskText = ref('');
const tasks = ref<Task[]>([]);

onBeforeMount(async () => await updateTasks());

async function addTask() {
    await useTasksStore().addTask(newTaskText.value, false);
    updateTasks();
    newTaskText.value = "";
}

async function updateTasks() {
    tasks.value = useTasksStore().tasks;
}

async function removeTask(task: Task) {
    await useTasksStore().deleteTask(task.id);
    updateTasks();
}

async function toggleTask(task: Task) {
    await useTasksStore().updateTask(task.id, !task.done);
    updateTasks();
}

</script>

<template>
    <div class="container py-3">
        <form @submit.prevent="addTask" class="mb-3">
            <fieldset>
                <legend v-if="newTaskText.length == 0">Add new task</legend>
                <legend v-else>{{ newTaskText }}</legend>
                <div class="input-group">
                    <input class="form-control" v-model="newTaskText" type="text" placeholder="New task"/>
                    <button class="btn btn-outline-primary">Add</button>
                </div>
            </fieldset>
        </form>

        <nav class="mb-3 overflow-hidden overflow-x-auto">
            <div class="nav nav-tabs flex-nowrap text-nowrap" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab">Home</button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab">Profile</button>
                <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab">Contact</button>
                <button  style="border-style: dashed !important" class="btn border border-bottom-0 rounded-0 rounded-top text-secondary">Add +</button>
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane show active" id="nav-home" role="tabpanel" tabindex="0">
                <div class="card mb-3" v-for="task in tasks" :key="task.id">
                    <div class="card-body d-flex justify-content-between">
                        <div class="form-check m-0 w-100">
                            <input class="form-check-input" :id="`task-${task.id}`" @input="toggleTask(task)" type="checkbox" :checked="task.done"/>
                            <label class="form-check-label w-100" :for="`task-${task.id}`">{{ task.title }}</label>
                        </div>
                        <button @click="removeTask(task)" class="btn-close"></button>
                    </div>
                </div>
            </div>
            <div class="tab-pane" id="nav-profile" role="tabpanel" tabindex="0"></div>
            <div class="tab-pane" id="nav-contact" role="tabpanel" tabindex="0"></div>
        </div>
    
        <button @click="console.log(newTaskText)" style="border-style: dashed !important" class="btn border p-3 w-100 text-secondary">
            + Add new task
        </button>
    </div>
</template>