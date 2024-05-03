fetch("/dining")
  .then((response) => response.json())
  .then((data) => {
    const tablesList = document.getElementById("tablesList");
    tablesList.innerHTML = "";
    data.tables.forEach((table) => {
      const li = document.createElement("li");
      li.innerHTML = `
                        <strong>Table Name:</strong> ${table.table_name}<br />
                        <strong>Seating Capacity:</strong> ${
                          table.seating_capacity
                        }<br />
                        <strong>Status:</strong> ${
                          table.occupied ? "Occupied" : "Empty"
                        }<br />
                    `;
      const updateStatusForm = document.createElement("form");
      updateStatusForm.action = `/dining/update-status/${table.table_id}`;
      updateStatusForm.method = "POST";
      updateStatusForm.innerHTML = `
                        <button type="submit" name="occupied" value="${!table.occupied}">
                            ${table.occupied ? "Vacate" : "Reserve"}
                        </button>
                    `;
      li.appendChild(updateStatusForm);
      const deleteTableForm = document.createElement("form");
      deleteTableForm.action = `/dining/delete/${table.table_id}`;
      deleteTableForm.method = "POST";
      deleteTableForm.innerHTML = `
                        <button type="submit">Delete</button>
                    `;
      li.appendChild(deleteTableForm);
      tablesList.appendChild(li);
    });
  })
  .catch((error) => console.error("Error fetching dining tables:", error));
