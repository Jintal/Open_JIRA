'use strict';

const addBtn = document.querySelector('.add-btn');
const removeBtn = document.querySelector('.remove-btn');
const modal = document.querySelector('.modal-cont');
const mainCont = document.querySelector('.main-cont');
const allPriorityColors = [...document.querySelectorAll('.priority-color')];
const toolBoxColors = [...document.querySelectorAll('.color')];

const colors = ['lightpink', 'lightblue', 'lightgreen', 'black'];


let modalPriorityColor = colors[colors.length-1];
let flagAddBtn = false;
let flagRemoveBtn = false;
let ticketsArr = [];

(
    function(){
        // Set the tickets already present in local Storage
        const localTicketsArr = JSON.parse(localStorage.getItem('jiraTickets'));

        if(localTicketsArr){
            localTicketsArr.forEach(function(ticketObj){
                const ticket = createTicket(ticketObj.ticketColor, ticketObj.ticketID, ticketObj.ticketTask);
                mainCont.appendChild(ticket);
            });
        }

    }
)();

function resetModal(){
    allPriorityColors.forEach(function(priorityColor){
        priorityColor.classList.remove('selected-border');
    });
    modal.querySelector('.black').classList.add('selected-border');
    modalPriorityColor = 'black';
    flagAddBtn = false;
    flagRemoveBtn = false;
    removeBtn.style.color = '';

    modal.style.display = 'none';
};

resetModal();

function displayModal() {
    modal.style.display = 'flex';
};

function handleModal() {
    flagAddBtn = !flagAddBtn;

    if(flagAddBtn) {
        displayModal();
        flagRemoveBtn = false;
        removeBtn.style.color = '';
    } else {
        resetModal();
    }
}

function highlightPriorityColor(event) {
    // Remove border form all priorityColors
    allPriorityColors.forEach(function(priorityColor){
        priorityColor.classList.remove('selected-border');
    });

    // Add border to new priorityColor
    event.target.classList.add('selected-border');

    const colorOfPriority = event.target.classList[0];
    modalPriorityColor = colorOfPriority;
}

function createTicket(ticketColor, ticketID, ticketTask) {
    const ticketCont = document.createElement('div');
    ticketCont.setAttribute('class', 'ticket-cont');

    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id"> #${ticketID} </div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
        </div>
    `;

    // Reset the textarea to be blank
    document.querySelector('.textarea-cont').value = '';
    return ticketCont;
}

// If pressed 'Shift'+'Enter', then add ticket 
function addTicket(event) {
    // When we press 'Shift' the function doesn't runs because if condition fails.
    // But when we press again 'Enter' while pressing 'Shift', event.shiftKey becomes 'true' as we were pressing it while pressing 'Enter' key
    if(event.shiftKey && event.key === 'Enter') {
        const ticket = createTicket(modalPriorityColor, shortid(), 
        document.querySelector('.textarea-cont').value);

        mainCont.appendChild(ticket);

        // Some event listeners can be added only after ticket is created, so these functions add event listeners to do so.
        handleRemoval(ticket);
        handleLock(ticket);
        handleColor(ticket);
        resetModal();


        // Creating array of objects and adding them to localStorage
        const ticketObj = {
            'ticketColor' : ticket.querySelector('.ticket-color').classList[1],
            'ticketTask' : ticket.querySelector('.task-area').innerText.trim(),
            'ticketID' : ticket.querySelector('.ticket-id').innerText.trim()
        }
        if(JSON.parse(localStorage.getItem('jiraTickets'))?.length) {
            ticketsArr = JSON.parse(localStorage.getItem('jiraTickets'));
        }
        
        ticketsArr.push(ticketObj);
        
        localStorage.setItem('jiraTickets', JSON.stringify(ticketsArr));
    }
}

function handleRemoval(ticket) {

    ticket.addEventListener('click', function(){
        if(flagRemoveBtn) {
            ticket.remove();

            // If ticket is deleted then it should be deleted in localstorage too.
            const ticketID = ticket.querySelector('.ticket-id').innerText.trim();
            const localTicketsArr = JSON.parse(localStorage.getItem('jiraTickets'));

            const newTicketArr = localTicketsArr.filter(function(localTicket){
                if(localTicket.ticketID !== ticketID) {
                    return true;
                }
            });

            localStorage.setItem('jiraTickets', JSON.stringify(newTicketArr));
        }
    })

}

function handleLock(ticket) {
    // When ticket will be created then only we would have access to it's lock so we add addEventListener to that lock only when the ticket is created.

    const ticketLock = ticket.querySelector('.ticket-lock').children[0];
    
    ticketLock.addEventListener('click', function(event) {
        ticketLock.classList.toggle('fa-lock');
        ticketLock.classList.toggle('fa-unlock');

        const taskArea = ticket.querySelector('.task-area');

        if(ticketLock.classList.contains('fa-unlock')) {
            taskArea.setAttribute('contenteditable', 'true');
        } else {
            taskArea.setAttribute('contenteditable', 'false');
        }

        // If text is changed of ticket then it should be updated in localstorage too.
        const ticketID = ticket.querySelector('.ticket-id').innerText.trim();
        const localTicketsArr = JSON.parse(localStorage.getItem('jiraTickets'));
        localTicketsArr.forEach(function(localTicket){
            if(localTicket.ticketID === ticketID) {
                localTicket.ticketTask = ticket.querySelector('.task-area').innerText.trim();
            }
        });

        localStorage.setItem('jiraTickets', JSON.stringify(localTicketsArr));
    });
    
}

function handleColor(ticket) {

    const ticketColorElem = ticket.querySelector('.ticket-color');

    ticketColorElem.addEventListener('click', function(){
        const currentTicketColor = ticketColorElem.classList[1];
        const idxOfCurrColor = colors.indexOf(currentTicketColor);
    
        const newTicketColor = colors[(idxOfCurrColor+1)%colors.length];
    
        ticketColorElem.classList.remove(currentTicketColor);
        ticketColorElem.classList.add(newTicketColor);

        // If color is changed of ticket then it should be updated in localstorage too.
        const ticketID = ticket.querySelector('.ticket-id').innerText.trim();
        const localTicketsArr = JSON.parse(localStorage.getItem('jiraTickets'));

        localTicketsArr.forEach(function(localTicket){
            if(localTicket.ticketID === ticketID) {
                localTicket.ticketColor = newTicketColor;
            }
        });

        localStorage.setItem('jiraTickets', JSON.stringify(localTicketsArr));

    });
}

function displayAllCards() {
    const allTickets = [...document.querySelectorAll('.ticket-cont')];

    allTickets.forEach(function(ticket){
        ticket.style.display = 'block';
    });

    return allTickets;
}

function displayFilteredCards(event) {
    const filterColor = event.target.classList[0];

    const allTickets =displayAllCards();

    allTickets.forEach(function(ticket){
        const ticketColor = ticket.querySelector('.ticket-color').classList[1];

        if(ticketColor !== filterColor) {
            ticket.style.display = 'none';
        }
    });
}


addBtn.addEventListener('click', handleModal);
modal.addEventListener('keydown', addTicket);

removeBtn.addEventListener('click', () => {
    flagRemoveBtn = !flagRemoveBtn;

    // Changes color of remove buttong based on where it is on or off
    if(flagRemoveBtn) {
        removeBtn.style.color = 'red';
    } else {
        removeBtn.style.color = '';
    }
});

allPriorityColors.forEach(function(priorityColor){
    priorityColor.addEventListener('click', highlightPriorityColor);
});

toolBoxColors.forEach(function(color) {
    color.addEventListener('click', displayFilteredCards);
    color.addEventListener('dblclick', displayAllCards);
})


// Web Storage API's
// The are set of mechanism's to store key-value pairs

// Types of Storage :-
//      |-> Local Storage :- The data doesn't get's lost even if browser if closed. It can store upto 5MB of data
//      |-> Session Storage :- It stores data only for a given session, if we close the browser or reload then all the data is lost.

// How to store :-
// The data to be stored should be in key-value pair, both the key and value should be in string form. To store objects we can use JSON.stringify() to convert our object into string. To get the string back to object we use JSON.parse()

