<%- include('../partials/header') %>
<main class="container" style="max-width:1100px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <h1 style="font-size:1.6rem;font-weight:800;">❤️ Saved Items</h1>
    <p style="color:var(--text-muted);margin-top:4px;"><%= products.length %> saved item<%= products.length !== 1 ? 's' : '' %></p>
  </div>

  <% if (products.length > 0) { %>
    <div class="products-grid">
      <% products.forEach(product => { %>
        <%- include('../partials/product-card', { product }) %>
      <% }) %>
    </div>
  <% } else { %>
    <div class="empty-state">
      <div style="font-size:4rem;margin-bottom:16px;">💔</div>
      <h2>No saved items yet</h2>
      <p>Browse products and tap the ❤️ to save items you like.</p>
      <a href="/" class="btn btn-primary" style="margin-top:20px;">Browse Products</a>
    </div>
  <% } %>
</main>
<%- include('../partials/footer') %>
