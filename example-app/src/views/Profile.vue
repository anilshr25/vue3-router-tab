<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Profile</h1>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar size="120" color="primary" class="mb-4">
              <span class="text-h3 text-white">JD</span>
            </v-avatar>
            <h2 class="text-h5 mb-2">John Doe</h2>
            <p class="text-body-2 text-medium-emphasis">Admin</p>
            <v-btn color="primary" variant="outlined" class="mt-4">
              Change Avatar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Personal Information</v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field label="First Name" variant="outlined" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field label="Last Name" variant="outlined" />
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Email" variant="outlined" type="email" />
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Phone" variant="outlined" />
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary">Update Profile</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>