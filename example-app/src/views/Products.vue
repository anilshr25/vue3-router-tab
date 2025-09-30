<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Products</h1>
      </v-col>

      <v-col cols="12" md="4" v-for="product in products" :key="product.id">
        <v-card>
          <v-img :src="product.image" height="200" cover />
          <v-card-title>{{ product.name }}</v-card-title>
          <v-card-subtitle>${{ product.price }}</v-card-subtitle>
          <v-card-text>
            <v-chip :color="product.stock > 0 ? 'success' : 'error'" size="small">
              {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary">Edit</v-btn>
            <v-btn variant="text" color="error">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const products = [
  { id: 1, name: 'Product 1', price: 99.99, stock: 10, image: 'https://via.placeholder.com/300' },
  { id: 2, name: 'Product 2', price: 149.99, stock: 5, image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Product 3', price: 199.99, stock: 0, image: 'https://via.placeholder.com/300' },
]
</script>