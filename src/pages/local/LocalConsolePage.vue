<template>
  <div class="local-console">
    <div class="row items-center q-mb-md">
      <div class="text-h5">云端</div>
      <q-space />
      <q-btn outline color="primary" dense label="新窗口打开" @click="open" />
    </div>
    <div class="text-caption text-grey-7 q-mb-sm">
      云端控制台（经本机 relay）。只显示平台设备与网络区，不再嵌套本机面板。
    </div>
    <iframe class="console-frame" :src="src" title="MyNet 网络区"></iframe>
  </div>
</template>

<script setup lang="ts">
const src = '/gui/app/nodes'
function open() {
  window.open(src, '_blank', 'noopener')
}
</script>
