<template>
    <div>
        <!-- Debug info -->
        <div v-if="DEV_MODE" style="background: yellow; padding: 10px; margin: 10px; border: 2px solid red;">
            <h3>DEBUG: ArticleGrid Component</h3>
            <p>isLoading: {{ isLoading }}</p>
            <p>error: {{ error }}</p>
            <p>currentChild: {{ currentChild?.name || 'None' }}</p>
            <p>currentArticles.length: {{ currentArticles.length }}</p>
            <p>Current condition: {{ isLoading ? 'LOADING' : error ? 'ERROR' : currentArticles.length === 0 ? 'EMPTY' : 'SHOWING ARTICLES' }}</p>
        </div>
        <!-- Loading state -->
        <div v-if="isLoading">
            <div v-if="DEV_MODE" style="background: blue; color: white; padding: 5px;">CONDITION: LOADING</div>
            <v-row>
                <v-col
                    v-for="n in 6"
                    :key="`loading-${n}`"
                    cols="12"
                    md="4"
                    sm="6"
                >
                    <v-card
                        class="mx-auto"
                        rounded="lg"
                        variant="outlined"
                    >
                        <v-card-text class="pa-5">
                            <div class="text-center">
                                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                <p class="mt-2">Loading articles...</p>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- Error state - only show if no articles available -->
        <div
            v-else-if="error && currentArticles.length === 0"
            class="text-center py-12"
        >
            <div v-if="DEV_MODE" style="background: red; color: white; padding: 5px;">CONDITION: ERROR WITH NO ARTICLES</div>
            <v-icon
                class="mb-4"
                color="error"
                size="64"
            >
                mdi-alert-circle-outline
            </v-icon>
            <h3 class="text-h6 text-error mb-2">Failed to load articles</h3>
            <p class="text-body-2 text-grey-darken-1 mb-4">
                {{ error }}
            </p>
            <v-btn
                color="primary"
                variant="outlined"
                @click="retryLoad"
            >
                Try Again
            </v-btn>
        </div>

        <!-- Empty state -->
        <div
            v-else-if="currentArticles.length === 0"
            class="text-center py-12"
        >
            <div v-if="DEV_MODE" style="background: orange; color: white; padding: 5px;">CONDITION: NO ARTICLES</div>
            <v-icon
                class="mb-4"
                color="grey-lighten-2"
                size="64"
            >
                mdi-book-outline
            </v-icon>
            <h3 class="text-h6 text-grey-darken-1 mb-2">
                No articles available
            </h3>
            <p class="text-body-2 text-grey-darken-1 mb-4">
                We're looking for articles tailored for your child. Please try
                refreshing or check back later.
            </p>
            <v-btn
                color="primary"
                variant="outlined"
                @click="refreshArticles"
            >
                <v-icon left>mdi-refresh</v-icon>
                Refresh Articles
            </v-btn>
        </div>

        <!-- Articles grid -->
        <v-row v-else>
            <!-- Debug: Show we're in the articles section -->
            <div v-if="DEV_MODE" style="background: green; color: white; padding: 10px; width: 100%;">
                SHOWING ARTICLES SECTION - Count: {{ currentArticles.length }}
            </div>
            <v-col
                v-for="article in currentArticles"
                :key="article.id"
                cols="12"
                md="4"
                sm="6"
            >
                <ArticleCard :article="article" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, watch, computed, ref } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useGuidanceStore } from '@/stores/guidance'
    import { useChildrenStore } from '@/stores/children'
    import { useAuthStore } from '@/stores/auth'
    import DEV_MODE, { devLog, devError } from '@/utils/devMode'
    import ArticleCard from './ArticleCard.vue'

    const guidanceStore = useGuidanceStore()
    const childrenStore = useChildrenStore()
    const authStore = useAuthStore()

    // Component lifecycle flag
    const isUnmounted = ref(false)

    // Reactive references from stores
    const { isLoading, error } = storeToRefs(guidanceStore)
    const { currentChild } = storeToRefs(childrenStore)

    // Computed articles for current child
    const currentArticles = computed(() => {
        if (!currentChild.value) return []
        return guidanceStore.getArticlesForChild(currentChild.value.id)
    })

    // Component lifecycle management
    onBeforeUnmount(() => {
        isUnmounted.value = true
    })

    // Load articles when component mounts
    onMounted(async () => {
        try {
            if (isUnmounted.value) return
            
            if (currentChild.value) {
                await guidanceStore.loadArticlesForChild(currentChild.value.id)
            }

            if (isUnmounted.value) return

            // Load saved articles if user is authenticated
            if (authStore.userId) {
                await guidanceStore.loadSavedArticles(authStore.userId)
            }
        } catch (err) {
            devError('Error loading articles on mount:', err)
        }
    })

    // Watch for child changes and load articles accordingly
    watch(
        () => currentChild.value?.id,
        async (newChildId) => {
            try {
                if (isUnmounted.value || !newChildId) return
                await guidanceStore.loadArticlesForChild(newChildId)
            } catch (err) {
                devError('Error loading articles for child:', err)
            }
        },
    )

    // Action handlers
    const refreshArticles = async (): Promise<void> => {
        if (currentChild.value) {
            await guidanceStore.refreshArticles(currentChild.value.id, true)
        }
    }

    const retryLoad = async (): Promise<void> => {
        if (currentChild.value) {
            await guidanceStore.loadArticlesForChild(currentChild.value.id)
        }
    }
</script>
