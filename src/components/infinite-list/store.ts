/*
 * @Author: 田鑫
 * @Date: 2024-08-19 18:31:33
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-20 11:25:50
 * @Description:
 */

import { reactive } from "vue";

class Item {
	constructor(index: number) {
		this.index = index;
	}
}

class Store {
	list = new Array(100000).fill("").map((_, i) => new Item(i));
	tableColumns = [
		{
			title: "Name",
			dataIndex: "name",
		},
		{
			title: "Salary",
			dataIndex: "salary",
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
	tableData = reactive(
		new Array(200).fill("").map((_, index) => ({
			key: index,
			name: `name - ${index}`,
			salary: index * 100,
			address: `address - ${index}`,
			email: `email - ${index}`,
		}))
	);
}
const store = reactive(new Store());
export default store;
