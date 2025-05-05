import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import { database } from '../components/Firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const customerTableHead = [
    'STT',
    'Mã sản phẩm',
    'Tên sản phẩm',
    'Số lượng',
    'Tổng giá',
    'Tên khách hàng',
    'SĐT',
    'Địa chỉ',
    'Trạng thái'
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const renderBody = (item, index) => (
    <tr key={index}>    
        <td>{index + 1}</td>
        <td>{item.id || ''}</td>  
        <td>{item.productTitle || 'Không có tên'}</td>
        <td>{item.quantity || 'Không có số lượng'}</td> 
        <td>{item.total ? `${item.total.toLocaleString()} VND` : '0 VND'}</td>
        <td>{item.customerName || 'Không có tên'}</td>
        <td>{item.customerPhone || 'Không có SDT'}</td>
        <td>{item.customerAddress || 'Không có địa chỉ'}</td>
        <td>{item.status || 'Chưa xác định'}</td>
    </tr>
);

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const usersRef = ref(database, 'Users');
        
        const unsubscribe = onValue(usersRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const allOrders = [];
                    
                    // Lặp qua tất cả users
                    Object.entries(data).forEach(([userId, userData]) => {
                        if (userData.orders) {
                            // Lặp qua tất cả orders của user
                            Object.entries(userData.orders).forEach(([orderId, order]) => {
                                // Lặp qua tất cả items trong order
                                if (order.items && Array.isArray(order.items)) {
                                    order.items.forEach(item => {
                                        allOrders.push({
                                            id: orderId,
                                            productId: item.id,
                                            productTitle: item.title,
                                            quantity: item.numberInCart,
                                            total: order.total,
                                            customerName: userData.profile_name,
                                            customerPhone: userData.phone,
                                            customerAddress: userData.address,
                                            status: order.status
                                        });
                                    });
                                }
                            });
                        }
                    });
                    
                    setOrders(allOrders);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error reading orders:", err);
                setError(err.message);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2 className="page-header">
                Orders
            </h2>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit='10'
                                headData={customerTableHead}
                                renderHead={(item, index) => renderHead(item, index)}
                                bodyData={orders}
                                renderBody={(item, index) => renderBody(item, index)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;