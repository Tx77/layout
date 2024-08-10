/*
 * @Author: 田鑫
 * @Date: 2024-08-10 15:19:52
 * @LastEditors: 田鑫
 * @LastEditTime: 2024-08-10 17:13:22
 * @Description:
 */

export interface Order {
	price: number;
	amount: number;
	cumulative: number;
	progressBar: string;
}

// 生成订单数据的函数
const generateOrders = (count: number): Order[] => {
	const orders: Order[] = [];
	let cumulative = 0;

	for (let i = 0; i < count; i++) {
		const price = parseFloat((Math.random() * 100).toFixed(2)); // 随机价格
		const amount = parseFloat((Math.random() * 5).toFixed(6)); // 随机数量
		cumulative += amount; // 累计数量
		const progressBar = (Math.random() * 100).toFixed(2) + "%";
		orders.push({ price, amount, cumulative, progressBar });
	}

	return orders;
};

// 接收主线程的消息并生成数据
self.onmessage = (e: MessageEvent) => {
	const count = e.data;
	const orders = generateOrders(count);
	self.postMessage(orders);
};
