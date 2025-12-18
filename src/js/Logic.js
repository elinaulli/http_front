export default class Logic {
	constructor(gui) {
		this.gui = gui;
		this.tickets = null;
		this.url = "https://http-server-1-y7sq.onrender.com";
		this.popUpReset = this.popUpReset.bind(this);
		this.popUpSubmit = this.popUpSubmit.bind(this);
		this.remove = this.remove.bind(this);
		this.editTicket = this.editTicket.bind(this);
		this.removeTicket = this.removeTicket.bind(this);
		this.showDescription = this.showDescription.bind(this);
		this.addTicket = this.addTicket.bind(this);
		this.toggleStatus = this.toggleStatus.bind(this);
		this.errorMessage = this.errorMessage.bind(this);
	}

	init() {
		this.getTickets();
		this.gui.widget.addEventListener("click", (e) => {
			this.handleClick(e);
		});
		console.log("Event listeners attached");
	}

	handleClick(e) {
		e.preventDefault();
		const target = e.target;

		// Обработка кнопки "Добавить тикет"
		if (target.classList.contains("addTicket") || target.closest(".addTicket")) {
			this.addTicket(e);
			return;
		}

		// Находим ближайшую задачу
		const task = target.closest(".task");
		if (!task) return;

		// Определяем что именно было нажато
		const editBtn = target.closest(".edit-btn");
		const deleteBtn = target.closest(".delete-btn");
		const statusRound = target.closest(
			".round:not(.edit-btn):not(.delete-btn)",
		);
		const nameCell = target.closest(".name-clickable"); // Изменили селектор

		if (editBtn) {
			this.editTicket(e);
		} else if (deleteBtn) {
			this.removeTicket(e);
		} else if (nameCell) {
			this.showDescription(e);
		} else if (statusRound) {
			this.toggleStatus(e);
		}
	}
	errorMessage(form) {
		const nameInput = form.querySelector(".input-name-new-ticket");
		const name = form.querySelector(".input-name-new-ticket").value.trim();
		const existingError = form.querySelector(".error-message");
		if (existingError) {
			existingError.remove();
		}
		nameInput.style.borderColor = "";
		nameInput.style.backgroundColor = "";

		if (!name) {
			nameInput.style.borderColor = "red";
			nameInput.style.borderWidth = "2px";

			let errorMsg = document.createElement("div");
			errorMsg.className = "error-message";
			errorMsg.style.color = "red";
			errorMsg.style.fontSize = "12px";
			errorMsg.style.marginTop = "5px";
			errorMsg.textContent = "Название обязательно";
			nameInput.parentNode.insertBefore(errorMsg, nameInput.nextSibling);

			nameInput.focus();
			return false;
		}
		return true;

	}
	async toggleStatus(e) {
		e.preventDefault();
		const task = e.target.closest(".task");
		if (!task) return;

		const taskId = task.dataset.id;
		if (!taskId) return;

		try {
			const ticket = this.tickets.find(t => t.id == taskId);
			if (!ticket) {
				console.error(`Тикет с ID ${taskId} не найден`);
				return;
			}

			const newStatus = !ticket.status;

			const getUrl = `${this.url}?method=ticketById&id=${taskId}`;
			const getResponse = await fetch(getUrl);

			const fullTicket = await getResponse.json();

			const updateUrl = `${this.url}?method=editTicket`;
			const formData = new FormData();

			formData.append('id', taskId);
			formData.append('title', fullTicket.name || ticket.name);
			formData.append('description', fullTicket.description || '');
			formData.append('status', newStatus);

			const updateResponse = await fetch(updateUrl, {
				method: 'POST',
				body: formData
			});

			if (!updateResponse.ok) {
				const errorText = await updateResponse.text();
				throw new Error(`HTTP ошибка ${updateResponse.status}: ${errorText}`);
			}

			ticket.status = newStatus;

			const statusRound = task.querySelector('.round');
			if (statusRound) {
				if (newStatus) {
					statusRound.innerHTML = '<svg class="done" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48H0z" fill="none"/><path d="M36 14l-2.83-2.83-12.68 12.69 2.83 2.83L36 14zm8.49-2.83L23.31 32.34 14.97 24l-2.83 2.83L23.31 38l24-24-2.82-2.83zM.83 26.83L12 38l2.83-2.83L3.66 24 .83 26.83z"/></svg>';
				} else {
					statusRound.innerHTML = '';
				}
			}

		} catch (error) {
			console.error('Ошибка при изменении статуса:', error);
		}
	}
	async sendRequest(method, query, type) {
		try {
			let url;
			const options = {
				method,
			};

			if (method === "GET") {
				url = `${this.url}?method=${query}`;
			} else if (method === "POST") {
				url = `${this.url}?method=${type}`;
				options.body = query;
			} else if (method === "DELETE") {
				url = `${this.url}?method=deleteTicket`;
				options.body = query;
				options.method = "POST";
			}

			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`HTTP error. Status: ${response.status}`);
			}

			return await response.text();
		} catch (error) {
			console.error("Request failed:", error);
			throw error;
		}
	}

	async getTickets() {
		try {
			const url = `${this.url}?method=allTickets`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ошибка ${response.status}`);
			}

			const tickets = await response.json();
			this.tickets = tickets;
			this.gui.fillFields(tickets);
		} catch (error) {
			console.error("Ошибка при загрузке тикетов:", error);
		}
	}

	async popUpSubmit(e) {
		e.preventDefault();
		const form = e.target.closest(".form");

		if (!form) {
			return;
		}

		const name = form.querySelector(".input-name-new-ticket").value.trim();
		const description = form.querySelector(".input-description-new-ticket").value.trim();
		const idForm = form.dataset.idform;

		if (!this.errorMessage(form)) {
			return;
		}

		try {
			if (idForm === "edit") {
				await this.editTicketSubmit(form, name, description);
			} else if (idForm === "add") {
				await this.addTicketSubmit(name, description);
			} else {
				console.error("Неизвестный тип формы:", idForm);
				return;
			}

			await this.getTickets();
			this.gui.popUp.classList.add("hidden");
		} catch (error) {
			console.error("Ошибка при сохранении тикета:", error);
		}
	}

	async editTicketSubmit(form, name, description) {
		const id = form.dataset.id;
		if (!id) {
			throw new Error("ID не найден");
		}

		// Получаем текущий статус
		const ticket = this.tickets.find(t => t.id == id);
		const currentStatus = ticket ? ticket.status : false;

		const request = new FormData();
		request.append("id", id);
		request.append("title", name);
		request.append("description", description || "");
		request.append("status", currentStatus);

		const response = await fetch(`${this.url}?method=editTicket`, {
			method: "POST",
			body: request,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ошибка ${response.status}: ${errorText}`);
		}
	}

	async addTicketSubmit(name, description) {
		const request = new FormData();
		request.append("title", name);
		request.append("description", description || "");
		request.append("status", false);

		const response = await fetch(`${this.url}?method=createTicket`, {
			method: "POST",
			body: request,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ошибка ${response.status}: ${errorText}`);
		}
	}

	async remove(e) {
		e.preventDefault();

		const form = e.target.closest(".form");
		if (!form) {
			console.error("Форма не найдена");
			return;
		}

		const id = form.dataset.id;
		if (!id) {
			console.error("ID не найден");
			return;
		}

		try {
			const url = `${this.url}?method=deleteTicket`;
			const request = new FormData();
			request.append("id", id);

			const response = await fetch(url, {
				method: "POST",
				body: request,
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Текст ошибки:", errorText);
				throw new Error(`HTTP ошибка ${response.status}: ${errorText}`);
			}

			await this.getTickets();
			this.gui.popUp.classList.add("hidden");
		} catch (error) {
			console.error("Ошибка удаления тикета:", error);
		}
	}
	popUpReset(e) {
		e.preventDefault();
		this.gui.popUp.classList.add("hidden");
	}

	async editTicket(e) {
		e.preventDefault();
		this.gui.popUp.innerHTML = "";

		const task = e.target.closest(".task");
		if (!task) {
			console.error("Элемент задачи не найден");
			return;
		}

		const taskId = task.dataset.id;
		if (!taskId) {
			console.error("ID задачи не найден");
			return;
		}

		try {
			const url = `${this.url}?method=ticketById&id=${taskId}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ошибка ${response.status}`);
			}

			const ticket = await response.json();
			this.gui.popUp.classList.remove("hidden");

			const popUpContent = this.gui.addPopUp(
				"Редактировать тикет",
				ticket.name,
				ticket.description,
				"edit",
				ticket.name,
				ticket.id,
			);

			this.gui.popUp.append(popUpContent);

			const submit = this.gui.popUp.querySelector(".okeyBtn");
			const cancel = this.gui.popUp.querySelector(".cancel");

			if (submit) {
				submit.addEventListener("click", this.popUpSubmit);
			}

			if (cancel) {
				cancel.addEventListener("click", this.popUpReset);
			}
		} catch (error) {
			console.error("Ошибка при загрузке тикета:", error);
		}
	}
	async removeTicket(e) {
		e.preventDefault();
		this.gui.popUp.innerHTML = "";

		const task = e.target.closest(".task");
		if (!task) return;

		const taskId = task.dataset.id;
		if (!taskId) return;

		try {
			const url = `${this.url}?method=ticketById&id=${taskId}`;
			const response = await fetch(url);

			if (!response.ok) throw new Error(`HTTP ошибка ${response.status}`);

			const ticket = await response.json();
			this.gui.popUp.classList.remove("hidden");

			const popUpContent = this.gui.showVertification(
				ticket.name,
				"remove",
				taskId,
			);
			this.gui.popUp.append(popUpContent);

			const submit = this.gui.popUp.querySelector(".okeyBtn");
			const cancel = this.gui.popUp.querySelector(".cancel");

			if (submit) {
				submit.replaceWith(submit.cloneNode(true));
				const newSubmit = this.gui.popUp.querySelector(".okeyBtn");
				newSubmit.addEventListener("click", async (event) => {
					event.preventDefault();
					try {
						const deleteUrl = `${this.url}?method=deleteTicket`;
						const formData = new FormData();
						formData.append("id", taskId);

						const deleteResponse = await fetch(deleteUrl, {
							method: "POST",
							body: formData,
						});

						if (!deleteResponse.ok) {
							const errorText = await deleteResponse.text();
							throw new Error(
								`HTTP ошибка ${deleteResponse.status}: ${errorText}`,
							);
						}

						const result = await deleteResponse.text();

						await this.getTickets();
						this.gui.popUp.classList.add("hidden");
					} catch (error) {
						console.error("Ошибка удаления:", error);
					}
				});
			}

			if (cancel) {
				cancel.addEventListener("click", (event) => {
					event.preventDefault();
					this.gui.popUp.classList.add("hidden");
				});
			}
		} catch (error) {
			console.error("Ошибка:", error);
		}
	}
	async showDescription(e) {
		e.preventDefault();
		const task = e.target.closest(".task");
		if (!task) {
			return;
		}

		const taskId = task.dataset.id;
		if (!taskId) {
			console.error("ID задачи не найден");
			return;
		}

		try {
			const url = `${this.url}?method=ticketById&id=${taskId}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ошибка ${response.status}`);
			}

			const ticket = await response.json();

			// Находим строку с деталями
			const detailsRow = task.querySelector(
				`.task-details-row[data-id="details-${taskId}"]`,
			);
			const detailsContent = task.querySelector(
				`.details-content[data-id="desc-content-${taskId}"]`,
			);

			if (!detailsRow || !detailsContent) {
				console.error("Элементы деталей не найдены");
				return;
			}

			// Заполняем контент
			detailsContent.textContent = ticket.description || "Описание отсутствует";

			// Проверяем, открыта ли уже подробная информация
			const isCurrentlyHidden = detailsRow.classList.contains("hidden");

			// Закрываем все открытые детали
			const allDetails = document.querySelectorAll(
				".task-details-row:not(.hidden)",
			);
			allDetails.forEach((detail) => {
				if (detail !== detailsRow) {
					detail.classList.add("hidden");
				}
			});

			// Переключаем видимость текущей детали
			if (isCurrentlyHidden) {
				detailsRow.classList.remove("hidden");
				console.log("Детали открыты");
			} else {
				detailsRow.classList.add("hidden");
				console.log("Детали закрыты");
			}
		} catch (error) {
			console.error("Ошибка при загрузке тикета:", error);
		}
	}
	async addTicket(e) {
		e.preventDefault();
		this.gui.popUp.innerHTML = "";
		this.gui.popUp.classList.remove("hidden");

		const popUpContent = this.gui.addPopUp(
			"Добавить тикет",
			"",
			"",
			"add",
			"",
			"",
		);

		this.gui.popUp.append(popUpContent);

		const submit = this.gui.popUp.querySelector(".okeyBtn");
		const cancel = this.gui.popUp.querySelector(".cancel");

		if (submit) {
			submit.addEventListener("click", this.popUpSubmit);
		}

		if (cancel) {
			cancel.addEventListener("click", this.popUpReset);
		}
	}
}