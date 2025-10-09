<script setup lang="ts">
import { addDay, format, isAfter, monthDays, monthEnd, monthStart, nearestDay, range } from '@formkit/tempo';

const rows = 5, cols = 7;
const weekDayNames = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const firstMonthDay = monthStart(new Date());
const weekDayName = format(firstMonthDay, "ddd", "en");
const numMonthDays = monthDays(firstMonthDay);
const weekDaysRange = range("ddd");

let tempDay = 0 - weekDayNames[weekDayName as keyof typeof weekDayNames];

switch (weekDayName) {
    case "Sun": tempDay -= 0;
        
        break;

    default:
        break;
}

</script>

<template>
    <div class="d-flex flex-column vh-100">
        <div class="container-fluid d-flex flex-column flex-grow-1 p-0">
            <div class="d-grid border-bottom" :style="`grid-template: repeat(${1}, 1fr) / repeat(${cols}, 1fr);`">
                <div v-for="wDay in weekDaysRange" class="m-2 text-center overflow-hidden">
                    {{ wDay }}
                </div>
            </div>
            <div class="d-grid h-100" :style="`grid-template: repeat(${rows}, 1fr) / repeat(${cols}, 1fr);`">
                <div v-for="num in (rows * cols)" class="overflow-hidden" :class="{ 'border-end': 0 != num % cols, 'border-bottom': num <= ((rows - 1) * cols) }">
                    <div v-if="tempDay >= 0 && tempDay <= numMonthDays" class="text-center m-2">{{ ++tempDay }}</div>
                    <div v-else>{{ ++tempDay ? '' : '' }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
* {
    padding: 0;
    margin: 0;
}
</style>