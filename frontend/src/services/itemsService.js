// BoltPatch: Complete itemsService implementation
import api from './api';
import routeMap from './routeMap';

// BoltPatch: Individual service functions
export const getItems = (params) => api.get(routeMap.items.list, { params }).then(r => r.data);
export const getItem = (id) => api.get(routeMap.items.item(id)).then(r => r.data);
export const createItem = (formData) => api.post(routeMap.items.create, formData, { 
  headers: { "Content-Type": "multipart/form-data" } 
}).then(r => r.data);
export const updateItem = (id, data) => api.put(routeMap.items.item(id), data).then(r => r.data);
export const deleteItem = (id) => api.delete(routeMap.items.delete + `?itemId=${id}`).then(r => r.data);

// BoltPatch: Enhanced itemsService object
export const itemsService = {
  async getLostItems() {
    const response = await api.get(routeMap.items.lost);
    return response.data;
  },

  async getFoundItems() {
    const response = await api.get(routeMap.items.found);
    return response.data;
  },

  async getLostItemsByCategory(category) {
    const response = await api.get(routeMap.items.lostByCategory(category));
    return response.data;
  },

  async getFoundItemsByCategory(category) {
    const response = await api.get(routeMap.items.foundByCategory(category));
    return response.data;
  },

  async createItem(formData) {
    const response = await api.post(routeMap.items.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteItem(itemId) {
    const response = await api.delete(`${routeMap.items.delete}?itemId=${itemId}`);
    return response.data;
  },

  async getItems(params = {}) {
    const response = await api.get(routeMap.items.list, { params });
    return response.data;
  },

  async getItem(id) {
    const response = await api.get(routeMap.items.item(id));
    return response.data;
  }
};

export default { getItems, getItem, createItem, updateItem, deleteItem };