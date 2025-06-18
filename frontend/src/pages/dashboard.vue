<template>
    <v-row>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="sleepOptions" :series="sleepSeries"></apexchart>
        </v-col>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="weightOptions" :series="weightSeries"></apexchart>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" lg="6">
            <apexchart width="100%" :options="heightOptions" :series="heightSeries"></apexchart>
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
        const response = await axios.get("http://127.0.0.1:8000/growth/1");
        const api_data = response.data

        console.log(api_data)

        const weight_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_weight

            return { x, y }
        });

        weightSeries.value[0].data = weight_series;

        const benchmark_weight_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_weight

            return { x, y }
        });

        weightSeries.value[1].data = benchmark_weight_series;

        const height_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_height

            return { x, y }
        })

        heightSeries.value[0].data = height_series;

        const benchmark_height_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_height

            return { x, y }
        })

        heightSeries.value[1].data = benchmark_height_series;

        const head_measure = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_head_circumference

            return { x, y }
        })

        headSeries.value[0].data = head_measure;

        const benchmark_head_measure = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_head_circumference

            return { x, y }
        })

        headSeries.value[1].data = head_measure;

    } catch (error) {
        console.error("Error: " + error)
    }
}

fetchGrowth()

const weightSeries = ref([
    {
        name: 'Actual Weight',
        data: [],
    },
    {
        name: 'Benchmark Weight',
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
    colors: ['darkgreen', 'darkred'],
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
        name: 'Actual Height',
        data: [],
    },
    {
        name: 'Benchmark Height',
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
    colors: ['darkgreen', 'darkred'],
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
        name: 'Actual Head Circumference',
        data: [],
    },
    {
        name: 'Benchmark Head Circumference',
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
    colors: ['darkgreen', 'darkred'],
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
        const response = await axios.get("http://127.0.0.1:8000/sleeptime/1");
        const api_data = response.data

        // console.log(api_data)

        const nap_series = api_data.map(item => {
            const check_in = new Date(item.check_in);
            const start_time = new Date(item.start_time);
            const end_time = new Date(item.end_time);

            return { check_in, start_time, end_time }
        })
            .filter(item => item.start_time.getHours() == 13)
            .map(item => {
                const x = item.check_in

                // reference: https://stackoverflow.com/questions/42454564/getting-the-difference-between-2-dates-in-javascript-in-hours-minutes-seconds
                const time_ms = item.end_time - item.start_time
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60))
                const total_mins = Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60 // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)) // total sleep hours

                return { x, y }
            })

        sleepSeries.value[0].data = nap_series;


        const night_series = api_data.map(item => {
            const check_in = new Date(item.check_in);
            const start_time = new Date(item.start_time);
            const end_time = new Date(item.end_time);

            return { check_in, start_time, end_time }
        })
            .filter(item => item.start_time.getHours() == 21)
            .map(item => {
                const x = item.check_in

                const time_ms = item.end_time - item.start_time
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60))
                const total_mins = Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60 // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)) // total sleep hours

                return { x, y }
            })

        sleepSeries.value[1].data = night_series;
        // sleepOptions.value.yaxis.max = Math.max(...night_series.map(item => item.y)) + Math.max(...nap_series.map(item => item.y)) + 2

    } catch (error) {
        console.error("Error: " + error)
    }
}

fetchSleep()

const sleepSeries = ref([
    {
        name: 'Nap',
        data: []
    },
    {
        name: 'Night',
        data: []
    }
])

const sleepOptions = ref({
    chart: {
        type: 'line', // line or area
        fontFamily: "Tahoma",
        stacked: true, // Enable stacking
    },
    theme: {
        mode: 'light',
        palette: 'palette5',
    },
    colors: ['darkred', 'darkgreen'],
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
        },
        min: 0,
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
        size: [5, 5],
        strokeColors: 'yellow'
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: 5
    },
})

</script>