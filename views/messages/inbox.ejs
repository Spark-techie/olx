<%- include('../partials/header') %>
<main class="container" style="max-width:800px;margin:40px auto;padding:0 20px;">
  <h1 style="font-size:1.5rem;font-weight:800;margin-bottom:24px;">💬 Messages</h1>

  <% if (inbox.length > 0) { %>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <% inbox.forEach(msg => { %>
      <div class="card" style="padding:18px;display:flex;align-items:center;gap:16px;transition:all .2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
        <!-- Product thumbnail -->
        <div style="flex-shrink:0;">
          <% if (msg.product_image) { %>
            <img src="/uploads/<%= msg.product_image %>" style="width:56px;height:56px;border-radius:10px;object-fit:cover;" onerror="this.style.display='none'"/>
          <% } else { %>
            <div style="width:56px;height:56px;border-radius:10px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.6rem;">📦</div>
          <% } %>
        </div>

        <!-- Message info -->
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:.95rem;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><%= msg.product_title || 'Deleted product' %></div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px;">
            From: <strong><%= msg.sender_name %></strong>
            <% if (msg.unread_count > 0) { %>
              <span style="background:#ff6b6b;color:#fff;padding:1px 7px;border-radius:20px;font-size:.7rem;font-weight:700;margin-left:6px;"><%= msg.unread_count %> new</span>
            <% } %>
          </div>
          <div style="font-size:.82rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><%= msg.message %></div>
        </div>

        <!-- Time + count -->
        <div style="flex-shrink:0;text-align:right;">
          <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:4px;">
            <%= new Date(msg.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) %>
          </div>
          <% if (msg.msg_count > 1) { %>
            <span style="background:var(--bg-secondary);padding:2px 8px;border-radius:20px;font-size:.72rem;color:var(--text-muted)"><%= msg.msg_count %> msgs</span>
          <% } %>
        </div>
      </div>
      <% }) %>
    </div>
  <% } else { %>
    <div class="empty-state">
      <div style="font-size:4rem;margin-bottom:16px;">💬</div>
      <h2>No messages yet</h2>
      <p>When buyers contact you about your listings, their messages will appear here.</p>
      <a href="/" class="btn btn-primary" style="margin-top:20px;">Browse Products</a>
    </div>
  <% } %>
</main>
<%- include('../partials/footer') %>
