<template>
    <div>
        <!-- Loading skeleton -->
        <div v-if="isLoading">
            <v-row>
                <v-col
                    v-for="n in 6"
                    :key="`skeleton-${n}`"
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
                            <v-skeleton-loader
                                type="card-heading,sentences,chip"
                                loading
                            />
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- Error state -->
        <div
            v-else-if="error"
            class="text-center py-12"
        >
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
            console.error('Error loading articles on mount:', err)
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
                console.error('Error loading articles for child:', err)
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
