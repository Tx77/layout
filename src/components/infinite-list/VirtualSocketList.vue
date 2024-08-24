<!--
 * @Author: 田鑫
 * @Date: 2024-08-24 14:29:14
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-24 15:59:57
 * @Description: 
-->
<template>
	<div>
		<a-table
			style="width: 600px"
			:columns="columns"
			:data="data"
			:virtual-list-props="{ height: 400 }"
			:pagination="false"
		/>
	</div>
</template>

<script setup lang="ts">
const columns = [
	{
		title: "Name",
		dataIndex: "name",
		fixed: "left",
		width: 140,
	},
	{
		title: "Address",
		dataIndex: "address",
	},
	{
		title: "Email",
		dataIndex: "email",
	},
];

const data = reactive(
	Array(1000)
		.fill(null)
		.map((_, index) => ({
			key: String(index),
			name: `User ${index + 1}`,
			address: "32 Park Road, London",
			email: `user.${index + 1}@example.com`,
		}))
);

setInterval(() => {
	const randomIndex = Math.floor(Math.random() * data.length);

	const randomField = ["name", "address", "email"][Math.floor(Math.random() * 3)];

	if (randomField === "name") {
		data[randomIndex].name = `User ${randomIndex + 1} (updated)`;
	} else if (randomField === "address") {
		data[randomIndex].address = `Updated Address ${Math.floor(Math.random() * 100)}`;
	} else if (randomField === "email") {
		data[randomIndex].email = `updated.${randomIndex + 1}@example.com`;
	}
}, 100);
</script>

<style lang="less" scoped></style>
