<template>
  <v-navigation-drawer
    permanent
    rail
    rail-width="80"
    color="white"
    elevation="2"
  >
    <template v-slot:prepend>
      <div class="pa-3 text-center">
        <v-img src="https://uceadaa513ecb56fd2611040f0d8.previews.dropboxusercontent.com/p/thumb/ACqXuIk4Ne-u4SEXWuzAnWdEdEOJodkQ2oH5fcb_ppBa2-xqywQOttb-ljWIlvFnnwGRdt-b9-ARjDHmno3K4xforlIW9RWKYpnvm3xx9ZeR15i6UQPddUvTuFrlG9HTuUgGX0yLTmw8IFQVbUmjViNOTa78jQdU3pKhqThY22isF6mzmKWx4Mzv5qCRDwwfy_BEx-wN6uehljByg87psUYCawuywOzLUDH0DubCDsgA2HqWHKPc9GKxqkX-FwIkl6xrkLxhzZrG98OvTsKY9bJsOzvJDPl1gFHmiU7LtRhhGqkwKPDwZODrXEg5Js_9yW6uHgvIZ1z1W9M-nymzQJzsUZubm2sp-oQBoFvPqY4j1XXLBEEkcVtzZWPtB9JabrA/p.png?is_prewarmed=true"></v-img>
      </div>
    </template>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.value"
        :value="item.value"
        class="nav-item"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="large">{{ item.icon }}</v-icon>
            <div class="text-caption mt-1">{{ item.title }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
const navItems = [
  { value: 'home', icon: 'mdi-home', title: 'Home' },
  { value: 'checkin', icon: 'mdi-clipboard-check', title: 'Check-In' },
  { value: 'dashboard', icon: 'mdi-chart-line', title: 'Dashboard' },
  { value: 'chatbot', icon: 'mdi-chat', title: 'Chatbot' },
  { value: 'guidance', icon: 'mdi-book-open-variant', title: 'Guidance' },
]
</script>

<style scoped>
.nav-item {
  margin: 8px 0;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.nav-item.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
