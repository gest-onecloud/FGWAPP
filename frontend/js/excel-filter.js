// V13.4 excel-filter.js - Filtros tipo Excel REAL
// IDs obligatorios: excel-panel-header, Buscar, Marcar todos / Desmarcar todos
const FGWExcelFilter = {
  panel: null,
  current: { theadId: null, tbodyId: null, colIndex: -1, colName: '', allValues: [], filteredValues: new Set(), searchTerm: '' },
  originalData: new Map(), // tbodyId -> original rows HTML array
  filters: new Map(), // "theadId:colIndex" -> Set of allowed values

  init() {
    this.panel = document.getElementById('excel-panel-header');
    if (!this.panel) {
      this.panel = document.createElement('div');
      this.panel.id = 'excel-panel-header';
      document.body.appendChild(this.panel);
    }
    this.panel.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px">
        <input id="excel-search" placeholder="Buscar..." style="padding:6px;border:1px solid #ccc;border-radius:6px;width:100%">
        <div style="display:flex;gap:6px">
          <button id="excel-select-all" style="flex:1;padding:4px 6px;font-size:11px">Marcar todos</button>
          <button id="excel-deselect-all" style="flex:1;padding:4px 6px;font-size:11px">Desmarcar todos</button>
        </div>
        <div id="excel-values-list" style="max-height:200px;overflow:auto;border:1px solid #eee;border-radius:6px;padding:4px;display:flex;flex-direction:column;gap:2px;background:#fafafa"></div>
        <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:4px">
          <button id="excel-apply" style="background:#111;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Aplicar</button>
          <button id="excel-clear" style="background:#fff;border:1px solid #ccc;padding:6px 12px;border-radius:6px;cursor:pointer">Limpiar</button>
        </div>
      </div>
    `;
    this.panel.style.cssText = 'min-width:220px;max-height:340px;z-index:100;position:absolute;display:none;background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;box-shadow:0 10px 25px rgba(0,0,0,.15);';
    
    document.getElementById('excel-search').addEventListener('input', (e) => {
      this.current.searchTerm = (e.target.value||'').toLowerCase();
      this.renderValuesList();
    });
    document.getElementById('excel-select-all').addEventListener('click', () => {
      this.current.filteredValues = new Set(this.getFilteredValuesForSearch().map(v=>String(v)));
      this.renderValuesList();
    });
    document.getElementById('excel-deselect-all').addEventListener('click', () => {
      this.current.filteredValues.clear();
      this.renderValuesList();
    });
    document.getElementById('excel-apply').addEventListener('click', () => this.applyFilter());
    document.getElementById('excel-clear').addEventListener('click', () => this.clearFilter());
    
    document.addEventListener('click', (e) => {
      if (!this.panel.contains(e.target) && !e.target.classList.contains('excel-filter-btn')) {
        // delay para no cerrar al abrir
        if (this.panel.style.display !== 'none') {
          // setTimeout(()=>{ this.panel.style.display='none'; }, 150);
        }
      }
    });
  },

  attach(theadId, tbodyId) {
    const thead = document.getElementById(theadId);
    if (!thead) return;
    const ths = thead.querySelectorAll('th');
    ths.forEach((th, idx) => {
      if (th.querySelector('.excel-filter-btn')) return;
      const btn = document.createElement('span');
      btn.className = 'excel-filter-btn';
      btn.innerHTML = ' ▼';
      btn.style.cssText = 'cursor:pointer;font-size:10px;opacity:.6;margin-left:4px;user-select:none';
      btn.title = 'Filtrar';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.open(theadId, tbodyId, idx, th.textContent.trim(), btn);
      });
      th.appendChild(btn);
      th.style.cursor = 'pointer';
      th.addEventListener('click', (e) => {
        if (e.target === th || e.target === btn) {
          // ya manejado por btn
        }
      });
    });
  },

  open(theadId, tbodyId, colIndex, colName, anchorEl) {
    if (!this.panel) this.init();
    this.current = { theadId, tbodyId, colIndex, colName, allValues: [], filteredValues: new Set(), searchTerm: '' };
    const key = `${theadId}:${colIndex}`;
    const existing = this.filters.get(key);
    if (existing) this.current.filteredValues = new Set(existing);

    // recolectar valores únicos de tbody
    const tbody = document.getElementById(tbodyId);
    const values = new Set();
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        const td = tr.cells[colIndex];
        if (td) {
          let v = td.textContent.trim();
          // limpiar b tags
          if (v.length > 0) values.add(v);
        }
      });
    }
    this.current.allValues = Array.from(values).sort((a,b)=>a.localeCompare(b));
    if (this.current.filteredValues.size === 0) {
      // por defecto todos marcados
      this.current.filteredValues = new Set(this.current.allValues.map(v=>String(v)));
    }
    // posicionar panel
    const rect = anchorEl.getBoundingClientRect();
    this.panel.style.left = (rect.left + window.scrollX) + 'px';
    this.panel.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    this.panel.style.display = 'block';
    document.getElementById('excel-search').value = '';
    document.getElementById('excel-search').focus();
    this.renderValuesList();
  },

  getFilteredValuesForSearch() {
    if (!this.current.searchTerm) return this.current.allValues;
    return this.current.allValues.filter(v => String(v).toLowerCase().includes(this.current.searchTerm));
  },

  renderValuesList() {
    const list = document.getElementById('excel-values-list');
    const vals = this.getFilteredValuesForSearch();
    list.innerHTML = vals.slice(0, 200).map(v => {
      const esc = String(v).replace(/"/g,'&quot;');
      const checked = this.current.filteredValues.has(String(v)) ? 'checked' : '';
      return `<label style="display:flex;align-items:center;gap:6px;padding:2px 4px;font-size:12px;cursor:pointer"><input type="checkbox" value="${esc}" ${checked} style="margin:0"> <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${esc}</span></label>`;
    }).join('') + (vals.length>200?`<div style="font-size:11px;opacity:.6;padding:4px">+${vals.length-200} más (usa Buscar)</div>`:'');
    // listeners
    list.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) this.current.filteredValues.add(val);
        else this.current.filteredValues.delete(val);
      });
    });
  },

  applyFilter() {
    const key = `${this.current.theadId}:${this.current.colIndex}`;
    // si todos seleccionados, remover filtro
    if (this.current.filteredValues.size === this.current.allValues.length || this.current.filteredValues.size === 0 && this.current.allValues.length===0) {
      // Si ningún valor, mostrar 0 filas? Mejor considerar como todos desmarcados = filtrar todo
      if (this.current.filteredValues.size === 0) {
        // filtrar todo (ninguno permitido)
        this.filters.set(key, new Set());
      } else {
        this.filters.delete(key);
      }
    } else {
      this.filters.set(key, new Set(this.current.filteredValues));
    }
    this.filterTable(this.current.tbodyId, this.current.theadId);
    this.panel.style.display = 'none';
  },

  clearFilter() {
    const key = `${this.current.theadId}:${this.current.colIndex}`;
    this.filters.delete(key);
    this.filterTable(this.current.tbodyId, this.current.theadId);
    this.panel.style.display = 'none';
  },

  clearAll(theadId) {
    for (let k of Array.from(this.filters.keys())) {
      if (k.startsWith(theadId+':')) this.filters.delete(k);
    }
    // restaurar todas las filas
    const tbodyId = theadId.replace('thead','tbody');
    const tbody = document.getElementById(tbodyId);
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr=>{ tr.style.display=''; });
    }
  },

  filterTable(tbodyId, theadId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const activeFilters = [];
    for (let [k, set] of this.filters.entries()) {
      if (k.startsWith(theadId+':')) {
        const colIdx = parseInt(k.split(':')[1]);
        activeFilters.push({ colIdx, set });
      }
    }
    tbody.querySelectorAll('tr').forEach(tr => {
      let visible = true;
      for (let f of activeFilters) {
        const td = tr.cells[f.colIdx];
        if (!td) continue;
        const val = td.textContent.trim();
        if (f.set.size===0) { visible = false; break; } // ninguno permitido
        if (!f.set.has(val)) { visible = false; break; }
      }
      tr.style.display = visible ? '' : 'none';
    });
    // actualizar contador si existe
    const visibleCount = Array.from(tbody.querySelectorAll('tr')).filter(tr=>tr.style.display!=='none').length;
    console.log(`[ExcelFilter] ${theadId} visibles: ${visibleCount}`);
  }
};

window.FGWExcelFilter = FGWExcelFilter;
document.addEventListener('DOMContentLoaded', ()=>FGWExcelFilter.init());
console.log('[V13.4] excel-filter.js OK');
