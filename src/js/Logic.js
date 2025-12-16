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
    // this.toggleStatus = this.toggleStatus.bind(this);
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
    if (
      target.classList.contains("addTicket") ||
      target.closest(".addTicket")
    ) {
      console.log("Add ticket button clicked");
      this.addTicket(e);
      return;
    }

    // Находим ближайшую задачу
    const task = target.closest(".task");
    if (!task) return;

    // const taskId = task.dataset.id;

    // Определяем что именно было нажато
    const editBtn = target.closest(".edit-btn");
    const deleteBtn = target.closest(".delete-btn");
    const statusRound = target.closest(
      ".round:not(.edit-btn):not(.delete-btn)",
    );
    const nameCell = target.closest(".name-clickable"); // Изменили селектор

    if (editBtn) {
      console.log("Edit button clicked");
      this.editTicket(e);
    } else if (deleteBtn) {
      console.log("Delete button clicked");
      this.removeTicket(e);
    } else if (nameCell) {
      console.log("Name clicked for description");
      this.showDescription(e);
    } else if (statusRound) {
      console.log("Status clicked");
      this.toggleStatus(e);
    }
  }
  //   async toggleStatus(e) {
  //     e.preventDefault();
  //     const task = e.target.closest('.task');
  //     if (!task) return;

  //     const taskId = task.dataset.id;
  //     if (!taskId) return;

  //     try {
  //       const ticket = this.tickets.find(t => t.id == taskId);
  //       if (!ticket) return;

  //       const newStatus = !ticket.status;

  //       const url = `${this.url}?method=editStatus`;
  //       const request = new FormData();
  //       request.append("id", taskId);
  //       request.append("status", newStatus);

  //       const response = await fetch(url, {
  //         method: "POST",
  //         body: request,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP ошибка ${response.status}`);
  //       }

  //       await this.getTickets();

  //     } catch (error) {
  //       console.error("Ошибка при изменении статуса:", error);
  //     }
  // }
  //     // this.getTickets();
  //     // this.gui.widget.addEventListener("click", (e) => {
  //     //   e.preventDefault();

  //     //   const target = e.target;
  //     //   let currId;

  //     //   if (target.tagName === "path" && target.closest(".img")) {
  //     //     currId = target.closest(".img").dataset.id;
  //     //   } else {
  //     //     currId = target.dataset.id;
  //     //   }

  //     //   if (currId === "edit") {
  //     //     this.editTicket(e);
  //     //   } else if (currId === "remove") {
  //     //     this.removeTicket(e);
  //     //   } else if (currId === "name") {
  //     //     this.showDescription(e);
  //     //   } else if (currId === "addTicket") {
  //     //     this.addTicket(e);
  //     //   }
  //     // });

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

      console.log(`Загружено ${tickets.length} тикетов`);
    } catch (error) {
      console.error("Ошибка при загрузке тикетов:", error);
    }
  }

  async popUpSubmit(e) {
    e.preventDefault();
    const form = e.target.closest(".form");

    if (!form) {
      console.error("Форма не найдена");
      return;
    }

    const name = form.querySelector(".input-name-new-ticket").value.trim();
    const description = form
      .querySelector(".input-description-new-ticket")
      .value.trim();
    const idForm = form.dataset.idform || form.dataset.idForm;

    if (!name) {
      console.error("Название обязательно");
      return;
    }

    try {
      let url;
      const request = new FormData();

      if (idForm === "edit") {
        const id = form.dataset.id;
        if (!id) {
          console.error("ID не найден");
          return;
        }

        request.append("id", id);
        request.append("title", name);
        request.append("description", description || "");
        url = `${this.url}?method=editTicket`;
      } else if (idForm === "add") {
        request.append("title", name);
        request.append("description", description || "");
        url = `${this.url}?method=createTicket`;
      } else {
        console.error("Неизвестный тип формы:", idForm);
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        body: request,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ошибка ${response.status}: ${errorText}`);
      }

      const resultText = await response.text();
      console.log("Ответ сервера:", resultText);

      await this.getTickets();
      this.gui.popUp.classList.add("hidden");
    } catch (error) {
      console.error("Ошибка при сохранении тикета:", error);
    }
  }

  async remove(e) {
    e.preventDefault();

    const form = e.target.closest(".form");
    if (!form) {
      console.error("Форма не найдена");
      console.log("Event target:", e.target);
      console.log("Closest form:", e.target.closest(".form"));
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

      //   const resultText = await response.text();

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

      this.gui.popUp.appendChild(popUpContent);

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

    console.log("Удаление тикета, ID:", taskId);

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
      this.gui.popUp.appendChild(popUpContent);

      const submit = this.gui.popUp.querySelector(".okeyBtn");
      const cancel = this.gui.popUp.querySelector(".cancel");

      if (submit) {
        // Удаляем старые обработчики чтобы не было дублирования
        submit.replaceWith(submit.cloneNode(true));
        const newSubmit = this.gui.popUp.querySelector(".okeyBtn");

        // Используем замыкание для передачи ID
        newSubmit.addEventListener("click", async (event) => {
          event.preventDefault();
          console.log("Удаление тикета с ID:", taskId);

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
            console.log("Результат удаления:", result);

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

    this.gui.popUp.appendChild(popUpContent);

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
