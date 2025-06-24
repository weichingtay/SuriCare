<template>
    <BaseCheckInDialog
        :model-value="modelValue"
        @update:model-value="handleDialogUpdate"
        max-width="600px"
        icon="mdi-emoticon-poop"
        icon-color="#000000"
        title="Poop"
        subtitle="Poop check for Jennie"
        :notes="notes"
        @update:notes="$emit('update:notes', $event)"
        :loading="loading"
        @save="handleSave"
        @close="handleClose"
    >
        <template #custom-content>
            <div class="poop-content">
                <!-- Color Selection -->
                <div class="color-section">
                    <label class="section-label">Color</label>
                    <div class="color-options">
                        <div
                            v-for="color in colorOptions"
                            :key="color.value"
                            class="color-option"
                            :class="{ 'selected': localColor === color.value }"
                            @click="selectColor(color.value)"
                        >
                            <div 
                                class="color-circle"
                                :style="{
                                    backgroundColor: color.hex,
                                    
                                }"
                            ></div>
                            <div class="color-label">
                                {{ color.label }}
                            </div>
                        </div>
                    </div>
                    <div v-if="errors.color" class="error-message">
                        {{ errors.color }}
                    </div>
                </div>

                <!-- Texture Selection -->
                <div class="texture-section">
                    <label class="section-label">Consistency</label>
                    <div class="texture-options">
                        <div
                            v-for="texture in textureOptions"
                            :key="texture.value"
                            class="texture-option"
                            :class="{ 'selected': localTexture === texture.value }"
                            @click="selectTexture(texture.value)"
                        >
                            <!-- Texture Visual -->
                            <div class="texture-visual-img">
                            <img 
                                :src="texture.image" 
                                alt="texture" 
                                class="texture-image"
                            />
                            <div class="texture-label">
                                {{ texture.label }}
                            </div>
                            </div>
                            
                        </div>
                    </div>
                    <div v-if="errors.texture" class="error-message">
                        {{ errors.texture }}
                    </div>
                </div>
            </div>
        </template>
    </BaseCheckInDialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: ''
    },
    texture: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'update:modelValue',
    'update:color',
    'update:texture',
    'update:notes',
    'save',
    'close'
])

// Color options exactly as shown in image
const colorOptions = [
    { value: 'yellow', label: 'Yellow', hex: '#FDD835' },
    { value: 'red', label: 'Red', hex: '#E53935' },
    { value: 'brown', label: 'Brown', hex: '#8D6E63' },
    { value: 'green', label: 'Green', hex: '#43A047' },
    { value: 'black', label: 'Black', hex: '#424242' },
    { value: 'gray', label: 'Gray', hex: '#9E9E9E' }
]

// Texture options with visual representations exactly as shown in image
const textureOptions = [
    { 
        value: 'pellets', 
        label: 'Pellets',
        image: '/assets/textures/pellets.png'
    },
    { 
        value: 'lumpy', 
        label: 'Lumpy',
        image: '/assets/textures/lumpy.png'
    },
    { 
        value: 'cracked', 
        label: 'Cracked',
        image: '/assets/textures/cracked.png'
    },
    { 
        value: 'smooth', 
        label: 'Smooth',
        image: '/assets/textures/smooth.png'
    },
    { 
        value: 'soft', 
        label: 'Soft',
        image: '/assets/textures/soft.png'
    },
    { 
        value: 'mushy', 
        label: 'Mushy',
        image: '/assets/textures/mushy.png'
    },
    { 
        value: 'watery', 
        label: 'Watery',
        image: '/assets/textures/watery.png'
    }
]

const localColor = ref('')
const localTexture = ref('')
const errors = ref({})

let colorTimeout = null
let textureTimeout = null

watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        localColor.value = props.color || ''
        localTexture.value = props.texture || ''
        errors.value = {}
    }
}, { immediate: true })

// 🔧 修改5: 条件性监听props变化
watch(() => props.color, (newValue) => {
    if (props.modelValue) {
        localColor.value = newValue || ''
    }
})

watch(() => props.texture, (newValue) => {
    if (props.modelValue) {
        localTexture.value = newValue || ''
    }
})

// 🔧 修改6: 防抖动emit处理
watch(localColor, (newValue) => {
    if (colorTimeout) clearTimeout(colorTimeout)
    colorTimeout = setTimeout(() => {
        emit('update:color', newValue)
        if (newValue && errors.value.color) {
            delete errors.value.color
        }
    }, 100)
})

watch(localTexture, (newValue) => {
    if (textureTimeout) clearTimeout(textureTimeout)
    textureTimeout = setTimeout(() => {
        emit('update:texture', newValue)
        if (newValue && errors.value.texture) {
            delete errors.value.texture
        }
    }, 100)
})

// 🔧 修改7: 改进选择方法 - 确保触发reactivity
const selectColor = (color) => {
    localColor.value = color
}

const selectTexture = (texture) => {
    localTexture.value = texture
}

// Validation
const validateColor = () => {
    if (!localColor.value) {
        errors.value.color = 'Please select a color'
        return false
    }
    delete errors.value.color
    return true
}

const validateTexture = () => {
    if (!localTexture.value) {
        errors.value.texture = 'Please select a texture'
        return false
    }
    delete errors.value.texture
    return true
}

// 🔧 修改8: 重写validateForm - 先清除所有错误
const validateForm = () => {
    errors.value = {}
    const isColorValid = validateColor()
    const isTextureValid = validateTexture()
    return isColorValid && isTextureValid
}

// 🔧 修改9: 重写handleDialogUpdate
const handleDialogUpdate = (value) => {
    emit('update:modelValue', value)
    if (!value) {
        nextTick(() => {
            errors.value = {}
            localColor.value = ''
            localTexture.value = ''
        })
    }
}

// 🔧 修改10: 重写handleClose
const handleClose = () => {
    errors.value = {}
    localColor.value = ''
    localTexture.value = ''
    emit('close')
}

// 🔧 修改11: 重写handleSave
const handleSave = () => {
    if (!validateForm()) {
        return
    }

    const poopData = {
        color: localColor.value,
        texture: localTexture.value,
        notes: props.notes
    }
    
    errors.value = {}
    emit('save', poopData)
}
</script>

<style scoped>
.poop-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.color-section,
.texture-section {
    display: flex;
    flex-direction: column;
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.color-options {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.color-option {
    width: 47px;
    height: 61px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px #E0E0E0 solid;
    border-radius: 8px;
    padding: 8px;
}

.color-option.selected{
    border:1px solid #d32f2f;
}

.color-circle {
    width: 24px;
    height: 24px;
    border-radius: 100%;
    margin-bottom: 4px;
}

.color-label {
    font-size: 10px;
    color: #333;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
}

.texture-options {
    display: flex;
    gap: 12px;
    justify-content: space-between;
}

.texture-option {
    width: 56px;
    height: 74px;
    border-radius: 8px;
    background-color: #FFffff;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
}

.texture-option.selected {
    border: 1px solid #D87179;
    transform: scale(1.05);
}

.texture-option:hover {
    transform: scale(1.05);
}

.texture-image{
    /* margin-bottom: 4px; */
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background-color: #FFFDE6;
}

.texture-label {
    font-size: 10px;
    color: #333;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}

.color-option:hover {
    transform: scale(1.05);
}

/* .color-option.selected {
    transform: scale(1.05);
} */

.error-message {
    color: #D87179;
    font-size: 12px;
    margin-top: 8px;
}

.color-options {
    min-height: 70px;
}


</style>