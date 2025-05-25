import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Card, CardContent, CardActions, Typography,
  TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel,
  Stack, Grid, Avatar, useMediaQuery, useTheme
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';

const categories = ['drinks', 'maindishes', 'salads', 'desserts', 'appetizers', 'soups', 'sides', 'fish'];

export default function AdminPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // PRODUCT MANAGEMENT STATE
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', discount: '', photo: '', category: 'drinks'
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn]);

  const loadProducts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/products');
      setProducts(res.data);
    } catch (e) {
      alert('Failed to load products');
    }
  };

  const saveProducts = async (updatedProducts) => {
    try {
      await axios.post('http://localhost:4000/api/products', updatedProducts);
      loadProducts();
      setEditingId(null);
    } catch (e) {
      alert('Failed to save products');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await axios.post('http://localhost:4000/api/upload', formData);
      return res.data.path;
    } catch {
      alert('Photo upload failed');
      return '';
    }
  };

  const handlePhotoChange = async (e, isNew = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadedPath = await uploadPhoto(file);
    if (isNew) {
      setNewProduct({ ...newProduct, photo: uploadedPath });
    } else {
      setEditData({ ...editData, photo: uploadedPath });
    }
  };

  const handleSave = () => {
    const updated = products.map(p => p.id === editingId
      ? { ...editData, price: Number(editData.price), discount: Number(editData.discount) }
      : p
    );
    saveProducts(updated);
  };

  const handleDelete = (id) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  };

  const handleAdd = () => {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const productToAdd = {
      ...newProduct,
      id: newId,
      price: Number(newProduct.price),
      discount: Number(newProduct.discount)
    };
    saveProducts([...products, productToAdd]);
    setNewProduct({ name: '', description: '', price: '', discount: '', photo: '', category: 'drinks' });
  };

  const sortedProducts = [...products].sort((a, b) => a.category.localeCompare(b.category));

  // LOGIN HANDLER
  const handleLogin = () => {
    const { username, password } = loginData;
    if (username === 'admin' && password === 'adminfog') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Render login form if not logged in
  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          maxWidth: 400,
          margin: 'auto',
          mt: 10,
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" mb={3} align="center">
          Admin Login
        </Typography>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={loginData.username}
          onChange={e => setLoginData({ ...loginData, username: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={loginData.password}
          onChange={e => setLoginData({ ...loginData, password: e.target.value })}
        />
        {loginError && (
          <Typography color="error" variant="body2" mt={1} mb={1} align="center">
            {loginError}
          </Typography>
        )}
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={!loginData.username || !loginData.password}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    );
  }

  // Render admin page after login
  return (
    <Box sx={{ maxWidth: 1000, margin: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Product Management
      </Typography>

      <Stack spacing={2} mb={4}>
        {/* New Product Card */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Add New Product</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name" value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newProduct.category}
                    label="Category"
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price" type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount" type="number"
                  value={newProduct.discount}
                  onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  fullWidth multiline rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth>
                  Upload Photo
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={e => handlePhotoChange(e, true)}
                  />
                </Button>
                {newProduct.photo && (
                  <Box mt={1} display="flex" justifyContent="center">
                    <Avatar
                      src={`http://localhost:4000${newProduct.photo}`}
                      variant="rounded"
                      sx={{ width: 100, height: 100 }}
                      alt="New product photo"
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!newProduct.name || !newProduct.category || !newProduct.price}
              fullWidth
            >
              Add Product
            </Button>
          </CardActions>
        </Card>
      </Stack>

      {/* Existing Products */}
      <Grid container spacing={2}>
        {sortedProducts.map((p) => (
          <Grid item xs={12} sm={6} key={p.id}>
            <Card variant="outlined">
              <CardContent>
                {editingId === p.id ? (
                  <Stack spacing={1}>
                    <TextField
                      label="Name"
                      value={editData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Description"
                      value={editData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                      fullWidth
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editData.category || ''}
                        label="Category"
                        onChange={e => handleChange('category', e.target.value)}
                      >
                        {categories.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Price"
                        type="number"
                        value={editData.price}
                        onChange={e => handleChange('price', e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Discount"
                        type="number"
                        value={editData.discount}
                        onChange={e => handleChange('discount', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Stack>
                    <Button variant="contained" component="label" fullWidth>
                      Upload Photo
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={e => handlePhotoChange(e, false)}
                      />
                    </Button>
                    {editData.photo && (
                      <Box mt={1} display="flex" justifyContent="center">
                        <Avatar
                          src={`http://localhost:4000${editData.photo}`}
                          variant="rounded"
                          sx={{ width: 100, height: 100 }}
                          alt="Product photo"
                        />
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {p.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Category: {p.category || '—'}
                    </Typography>
                    <Typography variant="body2">Price: ${p.price}</Typography>
                    <Typography variant="body2">Discount: ${p.discount}</Typography>
                    {p.photo ? (
                      <Box mt={1} display="flex" justifyContent="center">
                        <Avatar
                          src={`http://localhost:4000${p.photo}`}
                          variant="rounded"
                          sx={{ width: 120, height: 120 }}
                          alt={p.name}
                        />
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" align="center">
                        No photo
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                {editingId === p.id ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                    >
                      <Save fontSize="small" /> Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                    >
                      <Cancel fontSize="small" /> Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(p)}
                    >
                      <Edit fontSize="small" /> Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Delete fontSize="small" /> Delete
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
