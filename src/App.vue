<script setup lang="ts">
import SearchBox from './components/SearchBox.vue'
import './styles/button.css'
import './styles/card.css'
import './styles/utilities.css'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="site-title">
          <router-link to="/" class="site-title-link">Design System Documentation</router-link>
        </h1>
        <nav class="header-nav">
          <router-link to="/components-page" class="nav-link">Components</router-link>
          <router-link to="/utilities" class="nav-link">Utilities</router-link>
        </nav>
        <SearchBox />
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 1rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.site-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.site-title-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-title-link:hover {
  color: #646cff;
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #646cff;
  background-color: rgba(100, 108, 255, 0.1);
  text-decoration: none;
}

.nav-link.router-link-active {
  color: #646cff;
  background-color: rgba(100, 108, 255, 0.15);
  font-weight: 600;
}

.app-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  /* Add top padding to account for fixed header */
  padding-top: 6rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .site-title {
    text-align: center;
    font-size: 1.25rem;
  }

  .header-nav {
    justify-content: center;
    gap: 1rem;
  }

  .nav-link {
    padding: 0.75rem 1.5rem;
  }

  .app-main {
    padding: 1rem;
    /* Adjust top padding for taller mobile header */
    padding-top: 8rem;
  }
}

/* Legacy styles */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
