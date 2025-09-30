<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Settings</h1>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>General Settings</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field label="Site Name" variant="outlined" class="mb-4" />
              <v-text-field label="Email" variant="outlined" class="mb-4" />
              <v-textarea label="Description" variant="outlined" class="mb-4" />
              <v-btn color="primary">Save Changes</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>