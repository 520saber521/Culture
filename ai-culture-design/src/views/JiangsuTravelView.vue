<template>
  <div class="travel-container">
    <div class="floating-particles">
      <div v-for="i in 15" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <section class="page-header">
      <div class="header-bg-pattern"></div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="#FAFAFA"/>
        </svg>
      </div>
      <div class="header-content">
        <div class="header-icon-wrapper">
          <div class="icon-ring ring-1"></div>
          <div class="icon-ring ring-2"></div>
          <div class="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <h1 class="page-title">江苏旅游文化</h1>
        <p class="page-subtitle">探寻江南水乡韵味，品味千年文化底蕴</p>
        
        <div class="header-stats">
          <div class="stat-item" v-for="(stat, index) in statsData" :key="index">
            <div class="stat-icon">
              <component :is="stat.icon" />
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ animatedStats[index] }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="main-content">
      <section class="city-filter-section">
        <div class="filter-header">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            城市导航
          </h3>
        </div>
        <div class="city-tabs">
          <button 
            v-for="city in cities" 
            :key="city.name"
            class="city-tab"
            :class="{ active: selectedCity === city.name }"
            @click="selectCity(city.name)"
          >
            <span class="city-icon" v