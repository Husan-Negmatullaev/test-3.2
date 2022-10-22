if (!sessionStorage.getItem('timezone')) {
  const tz = jstz.determine() || 'UTC';
  sessionStorage.setItem('timezone', tz.name());
}

function changeHoursTo(time, changeNumber = 50) {
  const formatData = moment.duration(time).add(changeNumber, "minutes");
  const { hours, minutes } = formatData._data;

  return `${hours}:${minutes}`;
}

function userTimeLocalization(time) {
  let date = moment().format("YYYY-MM-DD");
  const currTz = sessionStorage.getItem('timezone');
  const stamp = date + "T" + time + "Z";

  const momentTime = moment(stamp);
  const tzTime = momentTime.tz(currTz);

  return tzTime.format("HH:mm");
}

window.onload = function () {
  let ticketData = {};

  const ticketForm = document.forms.ticket;
  const routeSelect = ticketForm.route;
  const timeSelect = ticketForm.time;
  const twoWay = ticketForm["two-way"];
  const numInput = ticketForm.num;
  const mainButton = numInput.nextElementSibling;

  ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const {
      price,
      countTicket,
      route,
      arrivedTime,
      orginalTime
    } = ticketData;

    const timetableContentText = document.querySelector(".timetable__content p");
    const totalPrice = price * countTicket

    console.log(ticketData);

    timetableContentText.innerHTML = `
      Вы выбрали ${countTicket} билета по маршруту ${route} стоимостью ${totalPrice}р.
      Это путешествие займет у вас ${arrivedTime ? "1 час 40 " : "50"} минут. 
      Теплоход отправляется в ${userTimeLocalization(orginalTime)} ${arrivedTime ? ", а прибудет в " +
        userTimeLocalization(changeHoursTo(arrivedTime)) : ""
      }.
      По московскому времени: 
      Теплоход отправляется в ${orginalTime}
      ${arrivedTime ? ", а прибудет в " + changeHoursTo(arrivedTime) : ""}.
    `;
  })

  routeSelect.addEventListener("change", (event) => {
    const route = event.target;
    const price = route.selectedOptions[0].dataset.price;

    timeSelect.disabled = false;

    if (route.value.length <= 10) {
      twoWay.closest(".two-way-timetable").classList.add("_hidden");

      return ticketData = {
        ...ticketData,
        price
      };
    } else {
      twoWay.closest(".two-way-timetable").classList.remove("_hidden");

      return ticketData = {
        ...ticketData,
        price,
        route: route.value,
      }
    }
  });

  timeSelect.addEventListener("change", (event) => {
    const targetItem = event.target;
    const optionTime = targetItem.value.substring(0, 5);
    const skipTime = changeHoursTo(targetItem.value.substring(0, 5));
    twoWay.disabled = false;

    if (twoWay.closest(".two-way-timetable._hidden")) {
      numInput.disabled = false;
      mainButton.disabled = false;

      return ticketData = {
        price: ticketData.price,
        orginalTime: optionTime,
        route: route.value,
      }
    } else {
      Array.from(twoWay.options)
        .forEach(option => {

          const optionWayTime = option.value.substring(0, 5);
          const routeTime = moment.duration(skipTime).asHours(optionWayTime);
          const timeWay = moment.duration(optionWayTime).asHours(skipTime);

          option.hidden = false;

          if (routeTime > timeWay) {
            option.hidden = true;
          }
        })

      return ticketData = {
        ...ticketData,
        orginalTime: optionTime
      }
    }
  });

  twoWay.addEventListener("change", (event) => {
    numInput.disabled = false;
    mainButton.disabled = false;

    const targetItem = event.target;

    const arrivedTime = targetItem.value.substring(0, 5);

    return ticketData = {
      ...ticketData,
      arrivedTime
    };
  });

  numInput.addEventListener("change", (event) => {
    const targetItem = event.target;
    ticketData.countTicket = targetItem.value;
  })
}