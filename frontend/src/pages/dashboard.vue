<template>
    <v-row>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn" @click="sleep_toggleWeek">Week</button>
                    <button type="submit" class="toggle-btn month-btn" @click="sleep_toggleMonth">Month</button>
                </v-container>
                <apexchart width="100%" :options="sleepOptions" :series="sleepSeries"></apexchart>
            </v-container>
        </v-col>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn">Week</button>
                    <button type="submit" class="toggle-btn month-btn">Month</button>
                </v-container>
                <apexchart width="100%" :options="weightOptions" :series="weightSeries"></apexchart>
            </v-container>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn">Week</button>
                    <button type="submit" class="toggle-btn month-btn">Month</button>
                </v-container>
                <apexchart width="100%" :options="heightOptions" :series="heightSeries"></apexchart>
            </v-container>
        </v-col>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn">Week</button>
                    <button type="submit" class="toggle-btn month-btn">Month</button>
                </v-container>
                <apexchart width="100%" :options="headOptions" :series="headSeries"></apexchart>
            </v-container>
        </v-col>
    </v-row>
</template>

<script setup>
import axios from 'axios';

async function fetchGrowth() {
    try {
        const response = await axios.get("http://127.0.0.1:8000/growth/1");
        const api_data = response.data

        // console.log(api_data)

        const weight_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_weight.toFixed(1)

            return { x, y }
        });

        weightSeries.value[0].data = weight_series;

        const benchmark_weight_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_weight.toFixed(1)

            return { x, y }
        });

        weightSeries.value[1].data = benchmark_weight_series;

        const height_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_height.toFixed(1)

            return { x, y }
        })

        heightSeries.value[0].data = height_series;

        const benchmark_height_series = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_height.toFixed(1)

            return { x, y }
        })

        heightSeries.value[1].data = benchmark_height_series;

        const head_measure = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.actual_head_circumference.toFixed(1)

            return { x, y }
        })

        headSeries.value[0].data = head_measure;

        const benchmark_head_measure = api_data.map(item => {
            const x = new Date(item.check_in)
            const y = item.benchmark_head_circumference.toFixed(1)

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
            const start_hour = start_time.getHours();
            const end_time = new Date(item.end_time);
            const end_hour = end_time.getHours();

            return { check_in, start_time, start_hour, end_time, end_hour }
        })
            .filter(item => item.start_hour >= 12 && item.start_hour <= 16)
            .map(item => {
                const tz_option = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'Asia/Singapore'
                }

                const x = item.check_in.toLocaleString('en-US', tz_option)

                // reference: https://stackoverflow.com/questions/42454564/getting-the-difference-between-2-dates-in-javascript-in-hours-minutes-seconds
                const time_ms = item.end_time - item.start_time
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60))
                const total_mins = Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60 // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)) // total sleep hours

                return { x, y }
            })

        sleep_nap.value = nap_series;
        sleepSeries.value[0].data = nap_series.slice(0, 7);


        const night_series = api_data.map(item => {
            const check_in = new Date(item.check_in);
            const start_time = new Date(item.start_time);
            const start_hour = start_time.getHours();
            const end_time = new Date(item.end_time);
            const end_hour = end_time.getHours();

            return { check_in, start_time, start_hour, end_time, end_hour }
        })
            .filter(item => item.start_hour >= 20 && item.start_hour <= 22)
            .map(item => {
                const tz_option = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'Asia/Singapore'
                }

                const x = item.check_in.toLocaleString('en-US', tz_option)

                const time_ms = item.end_time - item.start_time
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60))
                const total_mins = Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60 // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)) // total sleep hours

                return { x, y }
            })

        sleep_night.value = night_series
        sleepSeries.value[1].data = night_series.slice(0, 7);
        // sleepOptions.value.yaxis.max = Math.max(...night_series.map(item => item.y)) + Math.max(...nap_series.map(item => item.y)) + 2

    } catch (error) {
        console.error("Error: " + error)
    }
}

const sleep_nap = ref([])
const sleep_night = ref([])


fetchSleep()

// Update the Sleep Quality Chart
const sleep_toggleWeek = () => {

    const nap_week = sleep_nap.value.slice(0, 7);
    const night_week = sleep_night.value.slice(0, 7);

    sleepSeries.value = [
        {
            name: 'Nap',
            data: nap_week
        },
        {
            name: 'Night',
            data: night_week
        }
    ]

    console.log("Weekly Sleep chart updated")
}

const sleep_toggleMonth = () => {

    const nap_month = sleep_nap;
    const night_month = sleep_night;

    sleepSeries.value = [
        {
            name: 'Nap',
            data: nap_month
        },
        {
            name: 'Night',
            data: night_month
        }
    ]

    console.log("Monthly Sleep chart updated")
}

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
        type: 'area', // line or area
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
        tickPlacement: 'on',
        // reference: https://github.com/apexcharts/apexcharts.js/issues/167
        tickAmount: 'dataPoints',
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

<style scoped>
.toggle-btn {
    border: 1px solid black;
    padding: 2px 10px;
    font-family: Tahoma;
    font-size: 10px;
}

.week-btn {
    border-right: none;
    border-radius: 5px 0 0 5px;
}

.month-btn {
    border-radius: 0 5px 5px 0;
}
</style>