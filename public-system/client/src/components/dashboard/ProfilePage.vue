<!--
  ProfilePage Component - User Profile
  User profile card with stats and settings
-->

<template>
  <div class="screen active">
    <div class="scroll-area">
      <div class="profile-layout">
        <!-- Profile Card -->
        <div>
          <div class="profile-card">
            <div class="profile-card-top">
              <div class="profile-avatar-lg">{{ user.initials }}</div>
              <div class="profile-name">{{ user.name }}</div>
              <div class="profile-email">{{ user.email }}</div>
            </div>
            <div class="profile-stats">
              <div class="profile-stat">
                <div class="profile-stat-num">{{ user.stats.saved }}</div>
                <div class="profile-stat-label">Saved</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">{{ user.stats.listened }}</div>
                <div class="profile-stat-label">Listened</div>
              </div>
              <div class="profile-stat">
                <div class="profile-stat-num">{{ user.stats.reviews }}</div>
                <div class="profile-stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Panel -->
        <div class="settings-panel">
          <div
            v-for="(item, index) in settingsItems"
            :key="index"
            class="settings-item"
            @click="$emit('settingClick', item.action)"
          >
            <div :class="['settings-icon', item.danger ? 'danger' : '']">
              <i :class="['ti', item.icon]"></i>
            </div>
            <div :class="['settings-label', item.danger ? 'danger' : '']">{{ item.label }}</div>
            <i class="ti ti-chevron-right settings-arrow"></i>
          </div>
        </div>
      </div>
      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { userProfile } from '../../data/mockData';

// Emits
defineEmits(['settingClick', 'toast']);

// User data
const user = userProfile;

// Settings items
const settingsItems = [
  { label: 'Account', icon: 'ti-user', action: 'account' },
  { label: 'Notifications', icon: 'ti-bell', action: 'notifications' },
  { label: 'Playback', icon: 'ti-player-play', action: 'playback' },
  { label: 'Downloads', icon: 'ti-download', action: 'downloads' },
  { label: 'Privacy', icon: 'ti-lock', action: 'privacy' },
  { label: 'Appearance', icon: 'ti-palette', action: 'appearance' },
  { label: 'Help & Support', icon: 'ti-help', action: 'help' },
  { label: 'Sign Out', icon: 'ti-logout', action: 'signout', danger: true },
];
</script>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.screen.active {
  display: flex;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  padding: 28px 28px 0;
  align-items: start;
}

.profile-card {
  background: var(--bg2);
  border-radius: 16px;
  border: 0.5px solid var(--border);
  overflow: hidden;
}

.profile-card-top {
  background: linear-gradient(160deg, #1a1a2e, #13131a);
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #CECBF6;
  box-shadow: 0 0 0 3px rgba(83, 74, 183, 0.3);
}

.profile-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.profile-email {
  font-size: 12px;
  color: var(--text3);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 0.5px solid var(--border);
}

.profile-stat {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border-right: 0.5px solid var(--border);
}

.profile-stat:last-child {
  border-right: none;
}

.profile-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.profile-stat-label {
  font-size: 10px;
  color: var(--text3);
  font-weight: 500;
}

.settings-panel {
  background: var(--bg2);
  border-radius: 16px;
  border: 0.5px solid var(--border);
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 20px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.15s;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.settings-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bg3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: var(--text2);
  flex-shrink: 0;
}

.settings-icon.danger {
  background: rgba(153, 60, 29, 0.15);
}

.settings-icon.danger i {
  color: #f0997b;
}

.settings-label {
  flex: 1;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}

.settings-label.danger {
  color: #f0997b;
}

.settings-arrow {
  font-size: 17px;
  color: var(--text3);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .profile-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 18px 0;
  }

  .profile-card {
    width: 100%;
  }
}
</style>
