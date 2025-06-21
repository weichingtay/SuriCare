<template>
    <v-row>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="weightOptions" :series="weightSeries"></apexchart>
        </v-col>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="heightOptions" :series="heightSeries"></apexchart>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="sleepOptions" :series="sleepSeries"></apexchart>
        </v-col>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="headOptions" :series="headSeries"></apexchart>
        </v-col>
    </v-row>
</template>

<script setup>
import axios from 'axios';

async function fetchGrowth() {
    try {
        const response = await axios.get("http://127.0.0.1:8000/growth/");
        const api_data = response.data

        // console.log(api_data)

        const weight_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.weight

            return { x, y }
        });

        weightSeries.value[0].data = weight_series;

        const height_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.height

            return { x, y }
        })

        heightSeries.value[0].data = height_series;

        const head_measure = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.head_circumference

            return { x, y }
        })

        headSeries.value[0].data = head_measure;

    } catch (error) {
        console.error("Error: " + error)
    }
}

fetchGrowth()

const weightSeries = ref([
    {
        name: 'Weight',
        data: [],
    }
])

const weightOptions = ref({
    chart: {
        type: 'line', // line or area
        fontFamily: "Tahoma",
    },
    theme: {
        mode: 'light',
        palette: 'palette5',
    },
    colors: ['green'],
    xaxis: {
        type: 'datetime',
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: 'on'
    },
    yaxis: {
        title: {
            text: "Weight, kg"
        }
    },
    title: {
        text: "Weight Growth",
        style: {
            fontSize: '22px',
            fontWeight: 'bold',
            fontFamily: "Georgia",
            color: '#117a65'
        },
    },
    markers: {
        size: [5],
        strokeColors: 'yellow'
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: 5
    },
})


const heightSeries = ref([
    {
        name: 'Height',
        data: [],
    }
])

const heightOptions = ref({
    chart: {
        type: 'line', // line or area
        fontFamily: "Tahoma",
    },
    theme: {
        mode: 'light',
        palette: 'palette5',
    },
    colors: ['green'],
    xaxis: {
        type: 'datetime',
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: 'on'
    },
    yaxis: {
        title: {
            text: "Height, cm"
        }
    },
    title: {
        text: "Height Growth",
        style: {
            fontSize: '22px',
            fontWeight: 'bold',
            fontFamily: "Georgia",
            color: '#117a65'
        },
    },
    markers: {
        size: [5],
        strokeColors: 'yellow'
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: 5
    },
})


const headSeries = ref([
    {
        name: 'Head Circumference',
        data: [],
    }
])

const headOptions = ref({
    chart: {
        type: 'line', // line or area
        fontFamily: "Tahoma",
    },
    theme: {
        mode: 'light',
        palette: 'palette5',
    },
    colors: ['green'],
    xaxis: {
        type: 'datetime',
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: 'on'
    },
    yaxis: {
        title: {
            text: "Head circumference, cm"
        }
    },
    title: {
        text: "Head Circumference Growth",
        style: {
            fontSize: '22px',
            fontWeight: 'bold',
            fontFamily: "Georgia",
            color: '#117a65'
        },
    },
    markers: {
        size: [5],
        strokeColors: 'yellow'
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: 5
    },
})


async function fetchSleep() {
    try {
        const response = await axios.get("http://127.0.0.1:8000/sleeptime/");
        const api_data = response.data

        // console.log(api_data)

        const sleep_series = api_data.map(item => {
            const x = new Date(item.check_in)

            // reference: https://stackoverflow.com/questions/42454564/getting-the-difference-between-2-dates-in-javascript-in-hours-minutes-seconds
            const start_time = new Date(item.end_time);
            const end_time = new Date(item.start_time);
            const total_ms = start_time - end_time

            const total_hours = Math.floor(total_ms / (1000 * 60 * 60))
            const total_mins = Math.floor((total_ms % (1000 * 60 * 60)) / 60000) / 60 // 30 mins will become 0.5 hours
            const y = Number((total_hours + total_mins).toFixed(1)) // total sleep hours

            return { x, y }
        })

        sleepSeries.value[0].data = sleep_series;

        // console.log(sleep_series)

    } catch (error) {
        console.error("Error: " + error)
    }
}

fetchSleep()

const sleepSeries = ref([
    {
        name: 'Sleep',
        data: []
    }
])

const sleepOptions = ref({
    chart: {
        type: 'line', // line or area
        fontFamily: "Tahoma",
    },
    theme: {
        mode: 'light',
        palette: 'palette5',
    },
    colors: ['green'],
    xaxis: {
        type: 'datetime',
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: 'on'
    },
    yaxis: {
        title: {
            text: "Total Sleep, hours"
        }
    },
    title: {
        text: "Sleep Quality",
        style: {
            fontSize: '22px',
            fontWeight: 'bold',
            fontFamily: "Georgia",
            color: '#117a65'
        },
    },
    markers: {
        size: [5],
        strokeColors: 'yellow'
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: 5
    },
})

</script>