<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Simple Reactive Tab Test</v-card-title>
            <v-card-text>
              <p>Current title: <strong>{{ routeTabTitle }}</strong></p>
              <p>Current icon: <strong>{{ routeTabIcon }}</strong></p>
              <p>Is closable: <strong>{{ routeTabClosable }}</strong></p>
              
              <v-divider class="my-4" />
              
              <v-text-field
                v-model="newTitle"
                label="New Tab Title"
                @keyup.enter="updateTitle(newTitle)"
              />
              
              <v-btn 
                @click="updateTitle(newTitle)" 
                color="primary" 
                class="mr-2"
              >
                Update Title
              </v-btn>
              
              <v-btn 
                @click="changeIcon" 
                color="secondary" 
                class="mr-2"
              >
                Change Icon
              </v-btn>
              
              <v-btn 
                @click="toggleClosable" 
                color="info"
              >
                Toggle Closable
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Create reactive tab properties directly
const routeTabTitle = ref('Simple Test')
const routeTabIcon = ref('mdi-test-tube')
const routeTabClosable = ref(true)

// Local state for input
const newTitle = ref('New Title Here')

// Test functions
const updateTitle = (title: string) => {
  routeTabTitle.value = title
}

const changeIcon = () => {
  const icons = ['mdi-test-tube', 'mdi-star', 'mdi-heart', 'mdi-cog', 'mdi-fire']
  const currentIndex = icons.indexOf(routeTabIcon.value)
  const nextIcon = icons[(currentIndex + 1) % icons.length]
  routeTabIcon.value = nextIcon
}

const toggleClosable = () => {
  routeTabClosable.value = !routeTabClosable.value
}

// Explicitly expose reactive properties for RouterTab to access
defineExpose({
  routeTabTitle,
  routeTabIcon,
  routeTabClosable
})
</script>