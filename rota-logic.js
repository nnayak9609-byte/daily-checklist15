function autoSwitchRota() {
    let currentDay = parseInt(localStorage.getItem('dayNumber')) || 1;
    let currentRota = parseInt(localStorage.getItem('rota_num')) || 1;
    let rotaLength = 8;

    if (currentDay > rotaLength) {
        let nextRota = currentRota + 1;
        
        localStorage.setItem('rota_num', nextRota.toString());
        localStorage.setItem('dayNumber', '1');
        
        alert(`Transitioning to Rota ${nextRota}`);
        location.reload();
    }
}

// Execute immediately
autoSwitchRota();