import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import { database } from '../components/Firebase/firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';

const customerTableHead = [
    'STT',
    'ID',
    'Tên',
    'Số lượng',
    'Loại',
    'Hình ảnh',
    'Mô tả',
    'Giá',
    'Đánh giá',
    'Đề xuất'
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const renderBody = (item, index) => (
    <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.id}</td>
        <td>{item.title}</td>
        <td>{item.quantity || 0}</td>
        <td>{item.model?.join(', ')}</td>
        <td>
            {item.picUrl?.map((url, idx) => (
                <img key={idx} src={url} alt="item" style={{ width: '50px', marginRight: '5px' }} />
            ))}
        </td>
        <td>{item.description}</td>
        <td>{item.price}</td>
        <td>{item.rating}</td>
        <td>{item.showRecommended ? 'Có' : 'Không'}</td>
    </tr>
);

const Products = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        id: '',
        title: '',
        model: [],
        picUrl: [],
        description: '',
        price: '',
        rating: '',
        quantity: 1,
        categoryId: '',
        showRecommended: false
    });
    const [tempModel, setTempModel] = useState('');
    const [tempPicUrl, setTempPicUrl] = useState('');

    useEffect(() => {
        const itemsRef = ref(database, 'Items');
        const categoriesRef = ref(database, 'Category');
        
        const unsubscribeItems = onValue(itemsRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    // Chuyển đổi object thành mảng và sắp xếp theo ID số
                    const itemList = Object.entries(data)
                        .map(([key, value]) => ({
                            id: key,
                            ...value
                        }))
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
                    
                    setItems(itemList);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error reading items:", err);
                setError(err.message);
                setLoading(false);
            }
        });

        const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Error reading categories:", err);
            }
        });

        return () => {
            unsubscribeItems();
            unsubscribeCategories();
        };
    }, []);

    const handleAddProduct = () => {
        // Tìm ID tiếp theo (số lớn nhất hiện có + 1)
        const maxId = items.reduce((max, item) => {
            const itemId = parseInt(item.id);
            return itemId > max ? itemId : max;
        }, 0);
        
        setNewProduct({
            ...newProduct,
            id: (maxId + 1).toString(),
            quantity: 1
        });
        setShowAddForm(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: value
        });
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: checked
        });
    };

    const addModel = () => {
        if (tempModel.trim()) {
            setNewProduct({
                ...newProduct,
                model: [...newProduct.model, tempModel]
            });
            setTempModel('');
        }
    };

    const addPicUrl = () => {
        if (tempPicUrl.trim()) {
            setNewProduct({
                ...newProduct,
                picUrl: [...newProduct.picUrl, tempPicUrl]
            });
            setTempPicUrl('');
        }
    };

    const removeModel = (index) => {
        const updatedModels = newProduct.model.filter((_, i) => i !== index);
        setNewProduct({
            ...newProduct,
            model: updatedModels
        });
    };

    const removePicUrl = (index) => {
        const updatedPicUrls = newProduct.picUrl.filter((_, i) => i !== index);
        setNewProduct({
            ...newProduct,
            picUrl: updatedPicUrls
        });
    };

    const submitProduct = (e) => {
        e.preventDefault();
        
        if (!newProduct.title || !newProduct.price || !newProduct.categoryId) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Giá, Danh mục)');
            return;
        }

        const productToSubmit = {
            ...newProduct,
            price: parseFloat(newProduct.price),
            rating: newProduct.rating ? parseFloat(newProduct.rating) : 0,
            quantity: parseInt(newProduct.quantity) || 1,
            categoryId: parseInt(newProduct.categoryId)
        };

        // Sử dụng set thay vì push để có thể chỉ định ID
        set(ref(database, `Items/${newProduct.id}`), productToSubmit)
            .then(() => {
                alert('Thêm sản phẩm thành công!');
                setNewProduct({
                    id: '',
                    title: '',
                    model: [],
                    picUrl: [],
                    description: '',
                    price: '',
                    rating: '',
                    quantity: 1,
                    categoryId: '',
                    showRecommended: false
                });
                setShowAddForm(false);
            })
            .catch(error => {
                console.error("Error adding product: ", error);
                alert('Có lỗi xảy ra khi thêm sản phẩm');
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Products</h2>
                <button 
                    className="btn btn-add_product" 
                    onClick={handleAddProduct}
                >
                    + Thêm sản phẩm
                </button>
            </div>

            {showAddForm && (
                <div className="add-product-form">
                    <h3>Thêm sản phẩm mới</h3>
                    <form onSubmit={submitProduct}>
                        <div className="form-group">
                            <label>ID sản phẩm:</label>
                            <input
                                type="text"
                                name="id"
                                value={newProduct.id}
                                onChange={handleInputChange}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên sản phẩm: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={newProduct.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Số lượng: <span className="required">*</span></label>
                            <input
                                type="number"
                                name="quantity"
                                value={newProduct.quantity}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Danh mục: <span className="required">*</span></label>
                            <select
                                name="categoryId"
                                value={newProduct.categoryId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {Object.entries(categories).map(([key, category]) => (
                                    <option key={key} value={category.id}>
                                        {category.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Các phần khác giữ nguyên */}
                        <div className="form-group">
                            <label>Loại sản phẩm:</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={tempModel}
                                    onChange={(e) => setTempModel(e.target.value)}
                                    placeholder="Nhập loại sản phẩm"
                                />
                                <button type="button" onClick={addModel}>Thêm</button>
                            </div>
                            <div className="tag-container">
                                {newProduct.model.map((model, index) => (
                                    <span key={index} className="tag">
                                        {model}
                                        <button type="button" onClick={() => removeModel(index)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Hình ảnh (URL):</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={tempPicUrl}
                                    onChange={(e) => setTempPicUrl(e.target.value)}
                                    placeholder="Nhập URL hình ảnh"
                                />
                                <button type="button" onClick={addPicUrl}>Thêm</button>
                            </div>
                            <div className="tag-container">
                                {newProduct.picUrl.map((url, index) => (
                                    <span key={index} className="tag">
                                        <img src={url} alt="preview" style={{ width: '30px', height: '30px' }} />
                                        <button type="button" onClick={() => removePicUrl(index)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mô tả:</label>
                            <textarea
                                name="description"
                                value={newProduct.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Giá: <span className="required">*</span></label>
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Đánh giá (1-5):</label>
                            <input
                                type="number"
                                name="rating"
                                value={newProduct.rating}
                                onChange={handleInputChange}
                                min="1"
                                max="5"
                                step="0.1"
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="showRecommended"
                                    checked={newProduct.showRecommended}
                                    onChange={handleCheckboxChange}
                                />
                                Hiển thị ở mục đề xuất
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">Lưu</button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit='10'
                                headData={customerTableHead}
                                renderHead={renderHead}
                                bodyData={items}
                                renderBody={renderBody}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS giữ nguyên */}
            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .btn-add {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .btn-add:hover {
                    background-color: #45a049;
                }
                
                .add-product-form {
                    background: #f9f9f9;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .required {
                    color: red;
                }
                
                .form-group input[type="text"],
                .form-group input[type="number"],
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .input-group {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                
                .input-group input {
                    flex: 1;
                }
                
                .input-group button {
                    padding: 8px 15px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .tag-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .tag {
                    background: #e0e0e0;
                    padding: 5px 10px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .tag button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                }
                
                .checkbox-group {
                    display: flex;
                    align-items: center;
                }
                
                .checkbox-group input {
                    width: auto;
                    margin-right: 10px;
                }
                
                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .btn-submit {
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .btn-cancel {
                    background: #f44336;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Products;