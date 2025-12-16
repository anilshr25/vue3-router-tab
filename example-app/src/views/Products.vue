<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Products</h1>
      </v-col>
      <v-skeleton-loader
        v-if="products.length === 0"
        type="card"
        :loading="loading"
        :width="'100%'"
        :height="300"
        :count="6"
      />
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
import { onMounted, ref } from 'vue';

const loading = ref(true);

const products: { id: number; name: string; price: number; stock: number; image: string; }[] = [];

 onMounted(() => {
    setTimeout(() => {
      loading.value = false;
      products.push(
        { id: 1, name: "Product A", price: 29.99, stock: 10, image: "https://placehold.co/600x400" },
        { id: 2, name: "Product B", price: 49.99, stock: 0, image: "https://placehold.co/600x400" },
        { id: 3, name: "Product C", price: 19.99, stock: 5, image: "https://placehold.co/600x400" },
        { id: 4, name: "Product D", price: 99.99, stock: 2, image: "https://placehold.co/600x400" },
        { id: 5, name: "Product E", price: 39.99, stock: 0, image: "https://placehold.co/600x400" },
        { id: 6, name: "Product F", price: 59.99, stock: 8, image: "https://placehold.co/600x400" }
      );
    }, 2000);
 })

</script>