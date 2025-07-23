<template>
    <v-card
        class="mx-auto article-card"
        rounded="lg"
        variant="outlined"
        @click="openArticle"
    >
        <!-- Article Image -->
        <div class="article-image">
            <div class="image-placeholder">
                <v-icon
                    size="48"
                    color="white"
                    >mdi-book-open-variant</v-icon
                >
            </div>
        </div>

        <v-card-text
            class="pa-4 d-flex flex-column"
            style="height: calc(100% - 140px)"
        >
            <!-- Title -->
            <h3 class="article-title mb-3">
                {{ article.title }}
            </h3>

            <!-- Description -->
            <p class="article-description mb-4 flex-grow-1">
                {{ article.description }}
            </p>

            <!-- Bottom row with tags and save button - pushed to bottom -->
            <div class="d-flex justify-space-between align-center mt-auto">
                <div class="d-flex ga-2 flex-wrap">
                    <v-chip
                        v-for="tag in article.tags.slice(0, 2)"
                        :key="tag"
                        class="text-caption"
                        color="#E6E2DF"
                        variant="flat"
                        size="small"
                    >
                        {{ tag }}
                    </v-chip>
                </div>

                <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click.stop="handleToggleSave"
                >
                    <v-icon
                        :color="isSaved ? 'red' : 'grey'"
                        size="20"
                    >
                        {{ isSaved ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                </v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
    import { computed, inject } from 'vue'

    const props = defineProps({
        article: {
            type: Object,
            required: true,
        },
    })

    const toggleSaveArticle = inject('toggleSaveArticle')
    const isArticleSaved = inject('isArticleSaved')

    const isSaved = computed(() => {
        if (typeof isArticleSaved === 'function') {
            return isArticleSaved(props.article.id)
        }
        return false
    })

    const handleToggleSave = () => {
        if (typeof toggleSaveArticle === 'function') {
            toggleSaveArticle(props.article)
        }
    }

    const openArticle = () => {
        if (props.article.url) {
            window.open(props.article.url, '_blank')
        }
    }
</script>

<style scoped lang="scss">
    @import '@/styles/variables';
    .article-card {
        background-color: white;
        height: 100%;
        transition: transform 0.2s ease-in-out;
        border: 1.25px solid #aeaaa9;
        cursor: pointer;
        overflow: hidden;
    }

    .article-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: $app-primary-light;
        border-width: 2px;
    }

    .article-image {
        height: 140px;
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
    }

    .article-title {
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.4;
        color: #1f2937;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .article-description {
        font-size: 0.875rem;
        line-height: 1.5;
        color: #6b7280;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
