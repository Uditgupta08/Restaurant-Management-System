fetch("/dining")
  .then((response) => response.json())
  .then((data) => {
    const tablesList = document.getElementById("tablesList");
    tablesList.innerHTML = "";
    data.tables.forEach((table) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Table Name:</strong> ${table.table_name}<br />
        <strong>Seating Capacity:</strong> ${table.seating_capacity}<br />
        <strong>Status:</strong> ${table.occupied ? "Occupied" : "Empty"}<br />
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
      if (!table.occupied) {
        const deleteButtonForm = document.createElement("form");
        deleteButtonForm.id = `deleteForm${table.table_id}`;
        deleteButtonForm.action = `/dining/delete/${table.table_id}`;
        deleteButtonForm.method = "POST";
        deleteButtonForm.innerHTML = `
          <button type="button" class="deleteButton" data-tableid="${table.table_id}">Delete</button>
        `;
        li.appendChild(deleteButtonForm);
      }

      const vacateForm = document.createElement("form");
      vacateForm.action = `/dining/vacate/${table.table_id}`;
      vacateForm.method = "POST";
      vacateForm.innerHTML = `
        <button type="submit">Vacate</button>
      `;
      li.appendChild(vacateForm);

      tablesList.appendChild(li);
    });
  })
  .catch((error) => console.error("Error fetching dining tables:", error));
