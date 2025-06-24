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
                    <button type="submit" class="toggle-btn week-btn" @click="weight_toggleWeek">Week</button>
                    <button type="submit" class="toggle-btn month-btn" @click="weight_toggleMonth">Month</button>
                </v-container>
                <apexchart width="100%" :options="weightOptions" :series="weightSeries"></apexchart>
            </v-container>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn" @click="height_toggleWeek">Week</button>
                    <button type="submit" class="toggle-btn month-btn" @click="height_toggleMonth">Month</button>
                </v-container>
                <apexchart width="100%" :options="heightOptions" :series="heightSeries"></apexchart>
            </v-container>
        </v-col>
        <v-col cols="12" lg="6">
            <v-container>
                <v-container class="mb-1 d-flex justify-end pr-0">
                    <button type="submit" class="toggle-btn week-btn" @click="hc_toggleWeek">Week</button>
                    <button type="submit" class="toggle-btn month-btn" @click="hc_toggleMonth">Month</button>
                </v-container>
                <apexchart width="100%" :options="headOptions" :series="headSeries"></apexchart>
            </v-container>
        </v-col>
    </v-row>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';


// Setup initial reference for actual weight, height, head_circumference, sleep time
const actual = reactive({
    weight: [],
    height: [],
    head_circumference: [],
    sleep_time: {
        nap: [],
        night: []
    }
})

// Setup initial reference for benchmark weight, height & head_circumference
const benchmark = reactive({
    weight: [],
    height: [],
    head_circumference: [],
})


// Setup initial reference of min / max value on Y-axis for charts
const chart = reactive({
    weight: {
        y_min: 3.2,
        y_max: 18.3
    },
    height: {
        y_min: 49.1,
        y_max: 110
    },
    head_circumference: {
        y_min: 33.9,
        y_max: 50.7
    },
    sleep: {
        y_min: 0,
        y_max: 15
    }
})


// Chart data for Weight
const weightSeries = ref([
    {
        name: 'Actual',
        data: [],
    },
    {
        name: 'Benchmark',
        data: [],
    }
])


// Chart options for Weight
const weightOptions = ref({
    chart: {
        type: 'line', // line or area
        // fontFamily: "Tahoma",
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
        tickPlacement: 'on',
        tickAmount: "dataPoints",
    },
    yaxis: {
        title: {
            text: "Weight, kg"
        },
        min: () => chart.weight.y_min,
        max: () => chart.weight.y_max,
    },
    title: {
        text: "Weight Growth",
        style: {
            fontSize: '22px',
            fontWeight: 'bold',
            // fontFamily: "Georgia",
            color: '#117a65'
        },
    },
    // markers: {
    //     size: [5],
    //     strokeColors: 'yellow'
    // },
    stroke: {
        curve: 'smooth',
        width: 3,
        // dashArray: 5
    },
})


// Chart data for Height
const heightSeries = ref([
    {
        name: "Actual",
        data: [],
    },
    {
        name: "Benchmark",
        data: [],
    },
]);


// Chart options for Height
const heightOptions = ref({
    chart: {
        type: "line", // line or area
        // fontFamily: "Tahoma",
    },
    theme: {
        mode: "light",
        palette: "palette5",
    },
    colors: ["darkgreen", "darkred"],
    xaxis: {
        type: "datetime",
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: "on",
        tickAmount: "dataPoints",
    },
    yaxis: {
        title: {
            text: "Height, cm",
        },
        min: () => chart.height.y_min,
        max: () => chart.height.y_max
    },
    title: {
        text: "Height Growth",
        style: {
            fontSize: "22px",
            fontWeight: "bold",
            // fontFamily: "Georgia",
            color: "#117a65",
        },
    },
    // markers: {
    //     size: [5],
    //     strokeColors: 'yellow'
    // },
    stroke: {
        curve: "smooth",
        width: 3,
        // dashArray: 5
    },
});


// Chart data for Head Circumference
const headSeries = ref([
    {
        name: "Actual",
        data: [],
    },
    {
        name: "Benchmark",
        data: [],
    },
]);


// Chart options for Head Circumference
const headOptions = ref({
    chart: {
        type: "line", // line or area
        // fontFamily: "Tahoma",
    },
    theme: {
        mode: "light",
        palette: "palette5",
    },
    colors: ["darkgreen", "darkred"],
    xaxis: {
        type: "datetime",
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: "on",
        tickAmount: "dataPoints",
    },
    yaxis: {
        title: {
            text: "Head circumference, cm",
        },
        min: () => chart.head_circumference.y_min,
        max: () => chart.head_circumference.y_max
    },
    title: {
        text: "Head Circumference Growth",
        style: {
            fontSize: "22px",
            fontWeight: "bold",
            // fontFamily: "Georgia",
            color: "#117a65",
        },
    },
    // markers: {
    //     size: [5],
    //     strokeColors: 'yellow'
    // },
    stroke: {
        curve: "smooth",
        width: 3,
        // dashArray: 5
    },
});


// Chart data for Sleep
const sleepSeries = ref([
    {
        name: "Nap",
        data: [],
    },
    {
        name: "Night",
        data: [],
    },
]);


// Chart options for Sleep
const sleepOptions = ref({
    chart: {
        type: "area", // line or area
        // fontFamily: "Tahoma",
        stacked: true, // Enable stacking
    },
    theme: {
        mode: "light",
        palette: "palette5",
    },
    colors: ["darkred", "darkgreen"],
    xaxis: {
        type: "datetime",
        labels: {
            show: true,
            rotate: -45,
            datetimeUTC: false,
            formatter: function (_, timestamp, opts) {
                return opts.dateFormatter(new Date(timestamp), "dd MMM yy");
            },
        },
        tickPlacement: "on",
        // reference: https://github.com/apexcharts/apexcharts.js/issues/167
        tickAmount: "dataPoints",
    },
    yaxis: {
        title: {
            text: "Total Sleep, hours",
        },
        min: () => chart.sleep.y_min,
        max: () => chart.sleep.y_max
    },
    title: {
        text: "Sleep Quality",
        style: {
            fontSize: "22px",
            fontWeight: "bold",
            // fontFamily: "Georgia",
            color: "#117a65",
        },
    },
    markers: {
        size: [5, 5],
        strokeColors: "yellow",
    },
    stroke: {
        curve: "smooth",
        width: 3,
        // dashArray: 5,
    },
});


// Function to set maximum & minimum value for Y-axis of weight, height and head circumference
const setY_min_max = (actual_array, benchmark_array, series) => {

    // console.log(...actual_array)
    // console.log(...benchmark_array)

    const actual_min = Math.min(...actual_array);
    const benchmark_min = Math.min(...benchmark_array);

    const actual_max = Math.max(...actual_array);
    const benchmark_max = Math.max(...benchmark_array);

    let y_min = 0;
    let y_max = 0;

    if (benchmark_min < actual_min) {
        y_min = benchmark_min - 0.05 < 0 ? 0.0 : Math.floor(benchmark_min - 0.05);
    } else if (benchmark_min > actual_min) {
        y_min = actual_min - 0.05 < 0 ? 0.0 : Math.floor(actual_min - 0.05);
    } else {
        y_min = actual_min - 0.05 < 0 ? 0.0 : Math.floor(actual_min - 0.05);
    }

    if (benchmark_max > actual_max) {
        y_max = Math.ceil(benchmark_max + 0.05);
    } else if (benchmark_max < actual_max) {
        y_max = Math.ceil(actual_max + 0.05);
    } else {
        y_max = Math.ceil(actual_max + 0.05);
    }

    // console.log(`Min: ${y_min}, Max: ${y_max}`)

    // Update min & max values of Y-axis
    chart[series].y_min = y_min;
    chart[series].y_max = y_max

    // console.log(`Chart Min: ${chart.weight.y_min}, Chart Max: ${chart.weight.y_max}`)
};


// Function to set maximum value for Y-axis of sleep time
const setY_max_for_sleep = (nap_hour, night_hour) => {
    const nap_values = nap_hour;
    const night_values = night_hour;

    const total_sleep_values = nap_values.map((nap, index) => {
        const nap_time = nap;
        const night_time = night_values[index]
        const total = nap_time + night_time;

        return total.toFixed(1);
    })

    // console.log(`Sleep values: ${total_sleep_values}`)

    const y_max = Math.ceil(...total_sleep_values) + 1.0;

    // console.log(y_max)

    chart.sleep.y_max = y_max;
}


const fetchGrowth = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/growth/1");
        const growth_data = response.data;

        // console.log(growth_data);

        // Extract only Actual Weight
        const actual_weight = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.actual_weight;

            return { x, y }
        })

        // Extract only Benchmark Weight
        const benchmark_weight = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.benchmark_weight;

            return { x, y }
        })

        // console.log(actual_weight)
        // console.log(benchmark_weight)

        // Actual weight for last 30 days
        actual.weight = actual_weight;

        // Benchmark weight for last 30 days
        benchmark.weight = benchmark_weight;

        // Actual weight for last 7 days
        const actual_weight_week = computed(() => actual.weight.slice(0, 7));

        // Benchmark weight for last 7 days
        const benchmark_weight_week = computed(() => benchmark.weight.slice(0, 7));

        // console.log(actual_weight_week.value.map(item => item.y))
        // console.log(benchmark_weight_week.value.map(item => item.y))

        const actual_weight_week_values = actual_weight_week.value.map(item => item.y);
        const benchmark_weight_week_values = benchmark_weight_week.value.map(item => item.y);

        setY_min_max(actual_weight_week_values, benchmark_weight_week_values, 'weight')

        // Set default view of Weight chart with actual weight of last 7 days
        weightSeries.value[0].data = actual_weight_week;

        // Set default view of Weight chart with benchmark weight of last 7 days
        weightSeries.value[1].data = benchmark_weight_week;



        // Extract only Actual Height
        const actual_height = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.actual_height;

            return { x, y }
        })

        // Extract only Benchmark Height
        const benchmark_height = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.benchmark_height;

            return { x, y }
        })

        // Actual height for last 30 days
        actual.height = actual_height;

        // Benchmark height for last 30 days
        benchmark.height = benchmark_height;

        // Actual height for last 7 days
        const actual_height_week = computed(() => actual.height.slice(0, 7));

        // Benchmark height for last 7 days
        const benchmark_height_week = computed(() => benchmark.height.slice(0, 7));

        const actual_height_week_values = actual_height_week.value.map(item => item.y);
        const benchmark_height_week_values = benchmark_height_week.value.map(item => item.y);

        setY_min_max(actual_height_week_values, benchmark_height_week_values, 'height')

        // Set default view of Height chart with actual height of last 7 days
        heightSeries.value[0].data = actual_height_week;

        // Set default view of Height chart with benchmark height of last 7 days
        heightSeries.value[1].data = benchmark_height_week;


        // Extract only Actual Head Circumference
        const actual_hc = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.actual_head_circumference;

            return { x, y }
        })

        // Extract only Benchmark Head Circumference
        const benchmark_hc = growth_data.map(item => {
            const x = new Date(item.check_in);
            const y = item.benchmark_head_circumference;

            return { x, y }
        })

        // Actual head circumference for last 30 days
        actual.head_circumference = actual_hc;

        // Benchmark head circumference for last 30 days
        benchmark.head_circumference = benchmark_hc;

        // Actual head circumference for last 7 days
        const actual_hc_week = computed(() => actual.head_circumference.slice(0, 7));

        // Benchmark head circumference for last 7 days
        const benchmark_hc_week = computed(() => benchmark.head_circumference.slice(0, 7));

        const actual_hc_week_values = actual_hc_week.value.map(item => item.y);
        const benchmark_hc_week_values = benchmark_hc_week.value.map(item => item.y);

        setY_min_max(actual_hc_week_values, benchmark_hc_week_values, 'head_circumference')

        // Set default view of Head Circumference chart with actual Head Circumference of last 7 days
        headSeries.value[0].data = actual_hc_week;

        // Set default view of Head Circumference chart with benchmark Head Circumference chart of last 7 days
        headSeries.value[1].data = benchmark_hc_week;
    } catch (error) {
        console.error(`Error: ${error}`)
    }
}


const fetchSleep = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/sleeptime/1");
        const api_data = response.data;

        // console.log(api_data)

        const nap_series = api_data
            .map((item) => {
                const check_in = new Date(item.check_in);
                const start_time = new Date(item.start_time);
                const start_hour = start_time.getHours();
                const end_time = new Date(item.end_time);
                const end_hour = end_time.getHours();

                return { check_in, start_time, start_hour, end_time, end_hour };
            })
            .filter((item) => item.start_hour >= 12 && item.start_hour <= 16)
            .map((item) => {
                const tz_option = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    timeZone: "Asia/Singapore",
                };

                const x = item.check_in.toLocaleString("en-US", tz_option);

                // reference: https://stackoverflow.com/questions/42454564/getting-the-difference-between-2-dates-in-javascript-in-hours-minutes-seconds
                const time_ms = item.end_time - item.start_time;
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60));
                const total_mins =
                    Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60; // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)); // total sleep hours

                return { x, y };
            });

        const night_series = api_data
            .map((item) => {
                const check_in = new Date(item.check_in);
                const start_time = new Date(item.start_time);
                const start_hour = start_time.getHours();
                const end_time = new Date(item.end_time);
                const end_hour = end_time.getHours();

                return { check_in, start_time, start_hour, end_time, end_hour };
            })
            .filter((item) => item.start_hour >= 20 && item.start_hour <= 22)
            .map((item) => {
                const tz_option = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    timeZone: "Asia/Singapore",
                };

                const x = item.check_in.toLocaleString("en-US", tz_option);

                const time_ms = item.end_time - item.start_time;
                const total_hours = Math.floor(time_ms / (1000 * 60 * 60));
                const total_mins =
                    Math.floor((time_ms % (1000 * 60 * 60)) / 60000) / 60; // 30 mins will become 0.5 hours

                const y = Number((total_hours + total_mins).toFixed(1)); // total sleep hours

                return { x, y };
            });

        // console.log(nap_series)
        // console.log(night_series)

        // Nap hours for last 30 days
        actual.sleep_time.nap = nap_series;

        // Default view of nap hours for last 7 days
        sleepSeries.value[0].data = computed(() => actual.sleep_time.nap.slice(0, 7));

        // Night hours for last 30 days
        actual.sleep_time.night = night_series;

        // Default view of night hours for last 7 days
        sleepSeries.value[1].data = computed(() => actual.sleep_time.night.slice(0, 7));

        const nap_hours_week_values = computed(() => actual.sleep_time.nap.map(item => item.y).slice(0, 7));
        const night_hours_week_values = computed(() => actual.sleep_time.night.map(item => item.y).slice(0, 7));

        // console.log(nap_hours_week_values.value)
        // console.log(night_hours_week_values.value)

        setY_max_for_sleep(nap_hours_week_values.value, night_hours_week_values.value)

    } catch (error) {
        console.error("Error: " + error);
    }
}


onMounted(() => {
    try {
        fetchGrowth()
        fetchSleep()
    } catch (error) {
        console.error(`Error: ${error}`)
    }
})


// Update the Weight chart
const weight_toggleWeek = () => {
    weightSeries.value = [
        {
            name: "Actual",
            data: computed(() => actual.weight.slice(0, 7)),
        },
        {
            name: "Benchmark",
            data: computed(() => benchmark.weight.slice(0, 7)),
        },
    ];

    const actual_weight_weekly_values = actual.weight.map(item => item.y).slice(0, 7);
    const benchmark_weight_weekly_values = benchmark.weight.map(item => item.y).slice(0, 7);

    setY_min_max(actual_weight_weekly_values, benchmark_weight_weekly_values, 'weight')
};

const weight_toggleMonth = () => {
    weightSeries.value = [
        {
            name: "Actual",
            data: actual.weight,
        },
        {
            name: "Benchmark",
            data: benchmark.weight,
        },
    ];

    const actual_weight_monthly_values = actual.weight.map(item => item.y);
    const benchmark_weight_monthly_values = benchmark.weight.map(item => item.y);

    setY_min_max(actual_weight_monthly_values, benchmark_weight_monthly_values, 'weight')
};


// Update the Height chart
const height_toggleWeek = () => {
    heightSeries.value = [
        {
            name: "Actual",
            data: computed(() => actual.height.slice(0, 7)),
        },
        {
            name: "Benchmark",
            data: computed(() => benchmark.height.slice(0, 7)),
        },
    ];

    const actual_height_weekly_values = actual.height.map(item => item.y).slice(0, 7);
    const benchmark_height_weekly_values = benchmark.height.map(item => item.y).slice(0, 7);

    setY_min_max(actual_height_weekly_values, benchmark_height_weekly_values, 'height')
};

const height_toggleMonth = () => {
    heightSeries.value = [
        {
            name: "Actual",
            data: actual.height,
        },
        {
            name: "Benchmark",
            data: benchmark.height,
        },
    ];

    const actual_height_monthly_values = actual.height.map(item => item.y);
    const benchmark_height_monthly_values = benchmark.height.map(item => item.y);

    setY_min_max(actual_height_monthly_values, benchmark_height_monthly_values, 'height')
};


// Update Head Circumference chart
const hc_toggleWeek = () => {
    headSeries.value = [
        {
            name: "Actual",
            data: computed(() => actual.head_circumference.slice(0, 7)),
        },
        {
            name: "Benchmark",
            data: computed(() => benchmark.head_circumference.slice(0, 7)),
        },
    ];

    const actual_hc_weekly_values = actual.head_circumference.map(item => item.y);
    const benchmark_hc_weekly_values = benchmark.head_circumference.map(item => item.y);

    setY_min_max(actual_hc_weekly_values, benchmark_hc_weekly_values, 'head_circumference')
};

const hc_toggleMonth = () => {
    headSeries.value = [
        {
            name: "Actual",
            data: actual.head_circumference,
        },
        {
            name: "Benchmark",
            data: benchmark.head_circumference,
        },
    ];

    const actual_hc_monthly_values = actual.head_circumference.map(item => item.y);
    const benchmark_hc_monthly_values = benchmark.head_circumference.map(item => item.y);

    setY_min_max(actual_hc_monthly_values, benchmark_hc_monthly_values, 'head_circumference')
};


// Update the Sleep Chart
const sleep_toggleWeek = () => {
    sleepSeries.value = [
        {
            name: "Nap",
            data: computed(() => actual.sleep_time.nap.slice(0, 7)),
        },
        {
            name: "Night",
            data: computed(() => actual.sleep_time.night.slice(0, 7)),
        },
    ];

    const nap_hours_weekly_values = computed(() => actual.sleep_time.nap.map(item => item.y).slice(0, 7));
    const night_hours_weekly_values = computed(() => actual.sleep_time.night.map(item => item.y).slice(0, 7));

    setY_max_for_sleep(nap_hours_weekly_values.value, night_hours_weekly_values.value)
};

const sleep_toggleMonth = () => {
    sleepSeries.value = [
        {
            name: "Nap",
            data: actual.sleep_time.nap,
        },
        {
            name: "Night",
            data: actual.sleep_time.night,
        },
    ];

    const nap_hours_monthly_values = actual.sleep_time.nap.map(item => item.y);
    const night_hours_monthly_values = actual.sleep_time.night.map(item => item.y);

    setY_max_for_sleep(nap_hours_monthly_values, night_hours_monthly_values)

};


</script>

<style lang='scss' scoped>
@use '@/styles/variables' as *;
.toggle-btn {
    border: 1px solid black;
    padding: 2px 10px;
    font-family: $font-primary;
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