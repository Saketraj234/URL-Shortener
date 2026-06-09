let urls = [];
let qrCodeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
    loadUrls();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('shortenBtn').addEventListener('click', shortenUrl);
    document.getElementById('copyBtn').addEventListener('click', copyShortUrl);
    document.getElementById('qrBtn').addEventListener('click', toggleQRCode);
    document.getElementById('searchInput').addEventListener('input', filterUrls);
    
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const originalUrl = urlInput.value.trim();
    const shortenBtn = document.getElementById('shortenBtn');
    const btnText = shortenBtn.querySelector('.btn-text');
    const btnLoader = shortenBtn.querySelector('.btn-loader');
    
    if (!originalUrl) {
        showToast('Please enter a URL', 'error');
        return;
    }
    
    try {
        new URL(originalUrl);
    } catch {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    shortenBtn.disabled = true;
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ originalUrl })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('shortUrlDisplay').href = data.shortUrl;
            document.getElementById('shortUrlDisplay').textContent = data.shortUrl;
            document.getElementById('shortResult').style.display = 'block';
            
            // Generate and show QR code automatically
            const qrContainer = document.getElementById('qrCodeContainer');
            qrContainer.style.display = 'flex';
            
            // Clear completely before generating new QR code
            if (qrCodeInstance) {
                qrCodeInstance.clear();
            }
            qrContainer.innerHTML = '';
            
            qrCodeInstance = new QRCode(qrContainer, {
                text: data.shortUrl,
                width: 180,
                height: 180,
                colorDark: '#ffffff',
                colorLight: 'transparent',
                correctLevel: QRCode.CorrectLevel.H
            });
            
            showToast('URL shortened successfully!', 'success');
            urlInput.value = '';
            loadAnalytics();
            loadUrls();
        } else {
            showToast(data.error || 'Something went wrong', 'error');
        }
    } catch (error) {
        showToast('Failed to shorten URL', 'error');
    } finally {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        shortenBtn.disabled = false;
    }
}

function copyShortUrl() {
    const shortUrl = document.getElementById('shortUrlDisplay').textContent;
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shortUrl).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopy(shortUrl);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(shortUrl);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('Copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy', 'error');
        }
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
    
    document.body.removeChild(textArea);
}

function toggleQRCode() {
    const qrContainer = document.getElementById('qrCodeContainer');
    const shortUrl = document.getElementById('shortUrlDisplay').textContent;
    
    if (qrContainer.style.display === 'none') {
        qrContainer.style.display = 'flex';
        
        // Clear completely before generating new QR code
        if (qrCodeInstance) {
            qrCodeInstance.clear();
        }
        qrContainer.innerHTML = '';
        
        qrCodeInstance = new QRCode(qrContainer, {
            text: shortUrl,
            width: 180,
            height: 180,
            colorDark: '#ffffff',
            colorLight: 'transparent',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        qrContainer.style.display = 'none';
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        document.getElementById('totalUrls').textContent = data.totalUrls;
        document.getElementById('totalClicks').textContent = data.totalClicks;
        document.getElementById('activeLinks').textContent = data.activeLinks;
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

async function loadUrls() {
    try {
        const response = await fetch('/api/urls');
        urls = await response.json();
        renderUrls(urls);
    } catch (error) {
        console.error('Failed to load URLs:', error);
    }
}

function filterUrls(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = urls.filter(url => 
        url.originalUrl.toLowerCase().includes(searchTerm) ||
        url.shortCode.toLowerCase().includes(searchTerm)
    );
    renderUrls(filtered);
}

function renderUrls(urlList) {
    const tbody = document.getElementById('urlTableBody');
    const mobileCards = document.getElementById('mobileCards');
    
    if (urlList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No URLs yet. Create your first short URL above!
                </td>
            </tr>
        `;
        mobileCards.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                No URLs yet. Create your first short URL above!
            </div>
        `;
        return;
    }
    
    // Render desktop table
    tbody.innerHTML = urlList.map(url => {
        const createdAt = new Date(url.createdAt);
        const expiresIn = calculateExpiry(createdAt);
        const shortUrl = `${window.location.origin}/${url.shortCode}`;
        
        return `
            <tr>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="${url.originalUrl}" target="_blank">${url.originalUrl}</a>
                </td>
                <td>
                    <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                </td>
                <td>${url.clickCount}</td>
                <td>${formatDate(createdAt)}</td>
                <td>${expiresIn}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn table-btn-copy" onclick="copyUrl('${shortUrl}')">Copy</button>
                        <button class="table-btn table-btn-delete" onclick="deleteUrl('${url._id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render mobile cards
    mobileCards.innerHTML = urlList.map(url => {
        const createdAt = new Date(url.createdAt);
        const expiresIn = calculateExpiry(createdAt);
        const shortUrl = `${window.location.origin}/${url.shortCode}`;
        
        return `
            <div class="url-card">
                <div class="url-card-row">
                    <div>
                        <div class="url-card-label">Original URL</div>
                        <div class="url-card-value">
                            <a href="${url.originalUrl}" target="_blank">${url.originalUrl}</a>
                        </div>
                    </div>
                </div>
                <div class="url-card-row">
                    <div>
                        <div class="url-card-label">Short URL</div>
                        <div class="url-card-value">
                            <a href="${shortUrl}" target="_blank">${shortUrl}</a>
                        </div>
                    </div>
                </div>
                <div class="url-card-row">
                    <div>
                        <div class="url-card-label">Clicks</div>
                        <div class="url-card-value">${url.clickCount}</div>
                    </div>
                    <div>
                        <div class="url-card-label">Created At</div>
                        <div class="url-card-value">${formatDate(createdAt)}</div>
                    </div>
                </div>
                <div class="url-card-row">
                    <div style="width: 100%;">
                        <div class="url-card-label">Expires In</div>
                        <div class="url-card-value">${expiresIn}</div>
                    </div>
                </div>
                <div class="url-card-actions">
                    <button class="table-btn table-btn-copy" onclick="copyUrl('${shortUrl}')">Copy</button>
                    <button class="table-btn table-btn-delete" onclick="deleteUrl('${url._id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function calculateExpiry(createdAt) {
    const now = new Date();
    const expiry = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const diff = expiry - now;
    
    if (diff <= 0) return '<span class="expired-text">Expired</span>';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let expiryClass = 'expiry-good';
    if (hours < 1) expiryClass = 'expiry-warning';
    if (hours < 6) expiryClass = 'expiry-danger';
    
    return `<span class="${expiryClass}">${hours}h ${minutes}m ${seconds}s</span>`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function copyUrl(url) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        // Fallback for older browsers
        fallbackCopy(url);
    }
}

async function deleteUrl(id) {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    
    try {
        const response = await fetch(`/api/url/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('URL deleted successfully!', 'success');
            loadAnalytics();
            loadUrls();
        } else {
            showToast('Failed to delete URL', 'error');
        }
    } catch (error) {
        showToast('Failed to delete URL', 'error');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

setInterval(() => {
    if (urls.length > 0) {
        renderUrls(urls);
    }
}, 1000);
