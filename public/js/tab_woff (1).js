const layoutWOFF = document.querySelector('#layout-woff');  // lấy element layout-woff để theo dõi sự thay đổi (layout màn tạo)
let hasLoadedTaps = false;  //flag để kiểm tra đã load tabs hay chưa ,chạy một lần duy nhất, ở trường hợp khách load từ màn list vào
let globalTabsData = [];
let hasResetTab = false;

const loadTaps = () => {
    document.getElementById('loading-woff').style.display = 'block';  // loadding spinner
    const root = document.querySelector('#content-woff .content'); // lấy root của content-woff
    const tabMenu = root.querySelector('.tab-menu'); // lấy tab-menu để tạo các nút tab
    const tabMask = root.querySelector('.tab-mask'); // lấy tab-mask để hiển thị label

    const labelRows = Array.from(
        root.querySelectorAll('.row .editor-label')
    ).filter(el => /^\[.+\]$/.test(el.textContent.trim()))
        .map(label => label.closest('.row'));  // lọc các dòng có label dạng [TEXT] và lấy dòng cha

    const tabsData = [];

    labelRows.forEach((labelRow, index) => {
        const labelEl = labelRow.querySelector('.editor-label');
        const tabName = labelEl.textContent.trim().replace(/^\[(.*?)\]$/, '$1');

        // Tạo wrapper chứa các dòng sau labelRow
        const wrapper = document.createElement('div');

        let next = labelRow.nextElementSibling;
        while (next && !labelRows.includes(next)) {
            const current = next;
            next = next.nextElementSibling;
            wrapper.appendChild(current);
        }

        // Chèn wrapper ngay sau labelRow
        labelRow.after(wrapper);

        // Gán .tab-hidden cho tab không phải tab đầu
        if (index !== 0) {
            wrapper.classList.add('tab-hidden');
        }
        labelRow.classList.add('tab-hidden');

        tabsData.push({
            buttonLabel: tabName,
            labelRow: labelRow,
            contentWrapper: wrapper
        });
    });

    tabsData.forEach((tab, index) => {
        const btn = document.createElement('button');
        btn.textContent = tab.buttonLabel;
        if (index === 0) btn.classList.add('active');

        btn.addEventListener('click', () => {
            tabMenu.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Ẩn tất cả
            tabsData.forEach(t => {
                t.labelRow.classList.add('tab-hidden');
                t.contentWrapper.classList.add('tab-hidden');
            });

            // Hiện tab đang chọn
            tab.contentWrapper.classList.remove('tab-hidden');

            //  cập nhật tab-mask
            if (tabMask) {
                tabMask.textContent = tab.buttonLabel;
            }
        });

        tabMenu.appendChild(btn);
    });

    //  Đặt giá trị tab-mask ban đầu
    if (tabMask && tabsData.length > 0) {
        tabMask.textContent = tabsData[0].buttonLabel;
    }
    globalTabsData = tabsData; // lưu trữ dữ liệu tabs toàn cục để có thể sử dụng sau này
    //  ẩn loading spinner
    document.getElementById('loading-woff').style.display = 'none';
}

//  Reset UI về Tab đầu tiên
const resetTabActive = () => {
    const root = document.querySelector('#content-woff .content');
    const tabMenu = root.querySelector('.tab-menu');
    const tabMask = root.querySelector('.tab-mask');
    if (!tabMenu || globalTabsData.length === 0) return;

    const buttons = tabMenu.querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (buttons[0]) buttons[0].classList.add('active');

    globalTabsData.forEach(tab => {
        tab.labelRow.classList.add('tab-hidden');
        tab.contentWrapper.classList.add('tab-hidden');
    });

    const firstTab = globalTabsData[0];
    firstTab.labelRow.classList.remove('tab-hidden');
    firstTab.contentWrapper.classList.remove('tab-hidden');

    if (tabMask) {
        tabMask.textContent = firstTab.buttonLabel;
    }
};

//  Quan sát layoutWOFF hiển thị
let previousDisplay = getComputedStyle(layoutWOFF).display;
//  khi có sự thay đổi trong layoutWOFF, sẽ kiểm tra xem có tab-menu và tab-mask không
const observer = new MutationObserver(() => {
    const currentDisplay = getComputedStyle(layoutWOFF).display;
    if (currentDisplay !== 'none' && previousDisplay === 'none') {
        let root = document.querySelector('#content-woff .content');
        let tabMenu = root?.querySelector('.tab-menu');
        let tabMask = root?.querySelector('.tab-mask');

        if (tabMenu && tabMask) {
            if (!hasLoadedTaps) {
                hasLoadedTaps = true;
                loadTaps();
            } else {
                hasResetTab = true;
                resetTabActive(); // chỉ reset UI
            }
            previousDisplay = currentDisplay;
        }
    }
    if(currentDisplay !== 'none' && previousDisplay !== 'none')
    {
        if(!hasResetTab) {
            hasResetTab = true;
            resetTabActive(); // chỉ reset UI nếu vẫn đang hiển thị
        }
    }
    if(currentDisplay === 'none' && previousDisplay !== 'none')
    {
        hasResetTab = false; // reset lại flag khi ẩn layoutWOFF
    }
});

observer.observe(layoutWOFF, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
});

// Kiểm tra ngay từ lúc đầu render trang web (trường hợp layoutWOFF đã hiển thị sẵn) , ở màn edit hoặc create
if (layoutWOFF.style.display !== 'none') {
    let root = document.querySelector('#content-woff .content');
    let tabMenu = root?.querySelector('.tab-menu');
    let tabMask = root?.querySelector('.tab-mask');
    if (tabMenu && tabMask && !hasLoadedTaps) {
        hasLoadedTaps = true;
        // observer.disconnect();
        loadTaps();
    }
}

