export default class Gui {
	constructor() {
		this.widget = document.querySelector("#widget");
		this.tasksList = document.querySelector(".tasks_list");
		this.popUp = document.querySelector(".popup");
		this.btnCancel = document.querySelector(".cancel");
		this.btnOk = document.querySelector(".okeyBtn");
	}

	createElement(tag, className = "", content = "") {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (content) element.textContent = content;
		return element;
	}

	createInput(className, value = "", attributes = {}) {
		const input = this.createElement("input", className);
		input.value = value;
		Object.keys(attributes).forEach((attr) => {
			input.setAttribute(attr, attributes[attr]);
		});
		return input;
	}

	createTextarea(className, content = "", attributes = {}) {
		const textarea = this.createElement("textarea", className, content);
		Object.keys(attributes).forEach((attr) => {
			textarea.setAttribute(attr, attributes[attr]);
		});
		return textarea;
	}

	escapeHtml(text) {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	createTask(id, status, name, date) {
		// Строка таблицы
		const taskRow = this.createElement("tr", "task");
		taskRow.dataset.id = id;

		const mainRow = this.createElement("tr", "task-main-row");

		const statusCell = this.createElement("td", "status-cell");
		const statusRound = this.createElement("p", "round");

		if (status) {
			statusRound.innerHTML =
				'<svg class="done" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48H0z" fill="none"/><path d="M36 14l-2.83-2.83-12.68 12.69 2.83 2.83L36 14zm8.49-2.83L23.31 32.34 14.97 24l-2.83 2.83L23.31 38l24-24-2.82-2.83zM.83 26.83L12 38l2.83-2.83L3.66 24 .83 26.83z"/></svg>';
		}

		statusCell.append(statusRound);

		const nameCell = this.createElement("td", "text name-clickable");
		nameCell.textContent = name;
		nameCell.dataset.id = "name";
		nameCell.style.cursor = "pointer";

		const dateCell = this.createElement("td", "date");
		dateCell.textContent = date;
		dateCell.dataset.id = "date";

		const editCell = this.createElement("td", "change");
		const editBtn = this.createElement("p", "round edit-btn");
		editBtn.innerHTML =
			'<svg class="img edit" data-id="edit" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M6 34.5v7.5h7.5l22.13-22.13-7.5-7.5-22.13 22.13zm35.41-20.41c.78-.78.78-2.05 0-2.83l-4.67-4.67c-.78-.78-2.05-.78-2.83 0l-3.66 3.66 7.5 7.5 3.66-3.66z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>';
		editCell.append(editBtn);

		const deleteCell = this.createElement("td", "delete");
		const deleteBtn = this.createElement("p", "round delete-btn");
		deleteBtn.innerHTML =
			'<svg class="img close" data-id="remove" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 12.83l-2.83-2.83-11.17 11.17-11.17-11.17-2.83 2.83 11.17 11.17-11.17 11.17 2.83 2.83 11.17-11.17 11.17 11.17 2.83-2.83-11.17-11.17z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>';
		deleteCell.append(deleteBtn);

		mainRow.append(statusCell, nameCell, dateCell, editCell, deleteCell);

		const detailsRow = this.createElement("tr", "task-details-row hidden");
		detailsRow.dataset.id = `details-${id}`;

		const detailsCell = this.createElement("td", "task-details");
		detailsCell.colSpan = 5;

		const detailsContainer = this.createElement("div", "details-container");
		detailsContainer.dataset.id = `details-container-${id}`;

		const descHeader = this.createElement(
			"h4",
			"details-header",
			"Подробное описание:",
		);

		const descContent = this.createElement("div", "details-content");
		descContent.dataset.id = `desc-content-${id}`;

		detailsContainer.append(descHeader, descContent);
		detailsCell.append(detailsContainer);
		detailsRow.append(detailsCell);

		taskRow.append(mainRow, detailsRow);

		return taskRow;
	}

	addPopUp(header, title, description, idform, name, id) {
		const contentDiv = this.createElement("div", "content");
		const headerEl = this.createElement("h3", "popover_header", header);

		const form = this.createElement("form", "form");
		form.name = name;
		form.dataset.id = id;
		form.dataset.idform = idform;

		const shortDescLabel = this.createElement(
			"p",
			"name-new-ticket",
			"Краткое описание",
		);
		const titleInput = this.createInput("input-name-new-ticket", title, {
			name: "title",
			"data-id": "name-edit",
		});

		const fullDescLabel = this.createElement(
			"p",
			"description-new-ticket",
			"Подробное описание",
		);
		const descriptionTextarea = this.createTextarea(
			"input-description-new-ticket",
			description, {
				name: "description",
				"data-id": "description-edit",
			},
		);

		const buttonBlock = this.createElement("p", "btn_block");
		const cancelBtn = this.createElement("a", "btn cancel", "Отмена");
		const okBtn = this.createElement("a", "btn okeyBtn", "ОК");

		buttonBlock.append(cancelBtn, okBtn);
		form.append(
			shortDescLabel,
			titleInput,
			fullDescLabel,
			descriptionTextarea,
			buttonBlock,
		);
		contentDiv.append(headerEl, form);

		return contentDiv;
	}

	showDescription(header, name, description) {
		const contentDiv = this.createElement("div", "content");

		const headerEl = this.createElement("h3", "popover_header", header);

		const shortDescLabel = this.createElement(
			"p",
			"name-new-ticket",
			"Краткое описание",
		);
		const nameDisplay = this.createElement("p", "show-description");
		nameDisplay.textContent = name;
		nameDisplay.dataset.id = "name-edit";

		const fullDescLabel = this.createElement(
			"p",
			"description-new-ticket",
			"Подробное описание",
		);
		const descriptionDisplay = this.createElement("p", "show-description");
		descriptionDisplay.textContent = description;
		descriptionDisplay.dataset.id = "description-edit";

		const buttonBlock = this.createElement("p", "btn_block");
		const closeBtn = this.createElement("a", "btn cancel", "Закрыть");
		buttonBlock.append(closeBtn);

		contentDiv.append(
			headerEl,
			shortDescLabel,
			nameDisplay,
			fullDescLabel,
			descriptionDisplay,
			buttonBlock,
		);

		return contentDiv;
	}

	showVertification(name, idform, id) {
		const contentDiv = this.createElement("div", "content");

		const headerEl = this.createElement("h3", "popover_header");
		headerEl.append(document.createTextNode("Вы хотите удалить тикет "));

		const nameSpan = this.createElement("span", "show-name", name);
		headerEl.append(nameSpan);

		headerEl.append(document.createTextNode("?"));

		const form = this.createElement("form", "form");
		form.dataset.idform = idform;
		form.dataset.id = id;

		const buttonBlock = this.createElement("p", "btn_block");
		const cancelBtn = this.createElement("a", "btn cancel", "Нет");
		const confirmBtn = this.createElement("a", "btn okeyBtn", "Да");

		buttonBlock.append(cancelBtn, confirmBtn);
		form.append(buttonBlock);
		contentDiv.append(headerEl, form);

		return contentDiv;
	}

	fillFields(tickets) {
		this.tasksList.innerHTML = "";

		tickets.forEach((ticket) => {
			const taskElement = this.createTask(
				ticket.id,
				ticket.status,
				ticket.name,
				ticket.created,
			);
			this.tasksList.append(taskElement);
		});
	}
}