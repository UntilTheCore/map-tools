<script setup lang="ts">
import { registry, exampleOrder } from "../../../examples/src/registry";

const examples = exampleOrder.map((id) => ({ id, ...registry[id] }));
</script>

<template>
  <div class="example-grid">
    <a
      v-for="ex in examples"
      :key="ex.id"
      class="example-card"
      :href="`/examples-center/example.html?ex=${ex.id}`"
    >
      <div class="example-card__title">{{ ex.title }}</div>
      <div class="example-card__desc">{{ ex.description }}</div>
      <div class="example-card__apis">
        <span v-for="api in ex.apis" :key="api" class="example-card__api">
          {{ api }}
        </span>
      </div>
    </a>
  </div>
</template>
