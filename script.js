document.addEventListener('DOMContentLoaded', () => {
    let originalData = [];
    let processedData = [];
    let isSorted = false;

    const fetchData = () => {
        return fetch('https://apiswiggy.growwpaisa.com/api/delivery-partners')
            .then(response => response.json());
    };

    const displayData = (data) => {
        const table = document.getElementById('partners-table');
        table.innerHTML = ''; // Clear the table before adding new rows

        data.forEach((partner, index) => {
            const row = document.createElement('tr');
            const serialCell = document.createElement('td');
            const nameCell = document.createElement('td');
            const cityCell = document.createElement('td');
            const phoneCell = document.createElement('td');
            const created_atCell = document.createElement('td');

            serialCell.textContent = index + 1; // Display serial number
            nameCell.textContent = partner.name;
            cityCell.textContent = partner.city;
            phoneCell.textContent = partner.phone;
            created_atCell.textContent = partner.created_at;

            row.appendChild(serialCell);
            row.appendChild(nameCell);
            row.appendChild(cityCell);
            row.appendChild(phoneCell);
            row.appendChild(created_atCell);

            table.appendChild(row);
        });
    };

    const handleSortByPhone = () => {
        if (isSorted) {
            // Revert to original data
            displayData(originalData);
            isSorted = false;
            document.getElementById('sort-by-phone').textContent = 'Sort by Phone Number (Remove duplicates)';
        } else {
            // Filter out duplicates based on phone number
            const uniqueData = Array.from(new Set(originalData.map(partner => partner.phone)))
                .map(phone => {
                    return originalData.find(partner => partner.phone === phone);
                });

            // Sort by phone number and then by creation date if phone numbers are the same
            uniqueData.sort((a, b) => {
                // First, sort by phone number
                const phoneComparison = a.phone.localeCompare(b.phone);
                if (phoneComparison !== 0) {
                    return phoneComparison;
                }

                // If phone numbers are the same, sort by creation date
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateA - dateB; // Ascending order
            });

            displayData(uniqueData);
            isSorted = true;
            document.getElementById('sort-by-phone').textContent = 'Undo Sort';
        }
    };

    const handleFilterByDate = () => {
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            alert('Please select both start and end dates.');
            return;
        }

        // Ensure endDate is inclusive by adding one day
        endDate.setDate(endDate.getDate() + 1);

        const filteredData = originalData.filter(partner => {
            const partnerDate = new Date(partner.created_at);
            return partnerDate >= startDate && partnerDate < endDate;
        });

        displayData(filteredData);
    };

    const handleDownloadCsv = () => {
        const rows = document.querySelectorAll('table tr');
        let csvContent = '';
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowArray = Array.from(cols).map(col => col.textContent);
            csvContent += rowArray.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'delivery_partners.csv');
        a.click();
    };

    fetchData()
        .then(data => {
            originalData = data; // Save the original data
            processedData = data; // Initialize processed data
            displayData(data);

            document.getElementById('sort-by-phone').addEventListener('click', handleSortByPhone);
            document.getElementById('filter-date').addEventListener('click', handleFilterByDate);
            document.getElementById('download-csv').addEventListener('click', handleDownloadCsv);
        })
        .catch(error => console.error('Error fetching data:', error));
});
