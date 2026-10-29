<template>
  <div class="topo-wrap">
    <div v-if="!placed.length" class="text-grey-7 q-pa-md">没有符合过滤条件的对端</div>
    <svg v-else :viewBox="`0 0 ${W} ${H}`" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
      <line
        v-for="(nd, i) in placed"
        :key="'l'+i"
        :x1="cx" :y1="cy" :x2="nd.x" :y2="nd.y"
        :stroke="nd.color" stroke-width="1.8" stroke-opacity="0.75"
      />
      <text
        v-for="(nd, i) in placed"
        :key="'t'+i"
        :x="(cx + nd.x) / 2" :y="(cy + nd.y) / 2"
        text-anchor="middle" font-size="10" :fill="nd.color"
      >{{ nd.linkText }}</text>
      <g>
        <circle :cx="cx" :cy="cy" r="32" fill="#e4f3ed" stroke="#16805d" stroke-width="2" />
        <text :x="cx" :y="cy" text-anchor="middle" font-size="11" fill="#152a23">本机</text>
      </g>
      <g v-for="(nd, i) in placed" :key="'n'+i">
        <circle :cx="nd.x" :cy="nd.y" r="26" fill="#fff" :stroke="nd.color" stroke-width="1.8" />
        <text :x="nd.x" :y="nd.y - 2" text-anchor="middle" font-size="10" fill="#152a23">{{ nd.name }}</text>
        <text v-if="nd.vip && nd.vip !== nd.name" :x="nd.x" :y="nd.y + 11" text-anchor="middle" font-size="8" fill="#61766d">{{ nd.vip }}</text>
      </g>
    </svg>
    <div class="topo-filters q-mt-md">
      <span class="text-caption text-grey-7 q-mr-sm">显示：</span>
      <q-checkbox v-model="show.direct" dense label="直连" />
      <q-checkbox v-model="show.relay" dense label="中继" />
      <q-checkbox v-model="show.offline" dense label="离线" />
      <q-checkbox v-model="show.unknown" dense label="未知" />
    </div>
    <div class="text-caption text-grey-7 q-mt-sm">
      <span class="q-mr-md"><q-icon name="stop" color="positive" /> 直连</span>
      <span class="q-mr-md"><q-icon name="stop" color="warning" /> 中继</span>
      <span><q-icon name="stop" color="negative" /> 离线</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LocalPeer } from '../../types/local'
import { peerDisplayName, type NodeNameSource } from '../../utils/nodeDisplay'

const props = defineProps<{ peers: LocalPeer[]; names?: NodeNameSource }>()

const W = 760
const H = 420
const cx = W / 2
const cy = H / 2 - 10

const show = ref({ direct: true, relay: true, offline: true, unknown: true })

function linkMeta(link?: string, routed?: boolean) {
  const l = String(link || 'unknown')
  if (l === 'direct' || l === 'local') return { key: 'direct', text: '直连', color: '#16805d' }
  if (l === 'relay') return { key: 'relay', text: '中继', color: '#c49211' }
  if (l === 'offline') return { key: 'offline', text: '离线', color: '#c94b4b' }
  return { key: 'unknown', text: routed ? '可达' : '不可达', color: routed ? '#8a8f98' : '#c94b4b' }
}

const placed = computed(() => {
  const list = (props.peers || []).filter((p) => !p.is_self && p.node_id)
  const n = Math.max(list.length, 1)
  return list
    .map((p) => {
      const meta = linkMeta(p.link, p.routed)
      if (!show.value[meta.key as keyof typeof show.value]) return null
      return { p, meta }
    })
    .filter(Boolean)
    .map((item, i) => {
      const { p, meta } = item as { p: LocalPeer; meta: { text: string; color: string } }
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
      const R = 128
      return {
        x: cx + R * Math.cos(a) * 1.85,
        y: cy + R * Math.sin(a),
        name: peerDisplayName(p, props.names || {}).slice(0, 14),
        vip: String(p.overlay || ''),
        linkText: meta.text,
        color: meta.color
      }
    })
})
</script>
