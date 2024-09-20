import { IBook } from "../interfaces/IBook";

export const getBooks = async () => {
    const response = await fetch('https://localhost:7224/api/Books');
    const data = await response.json();
    return data;
}

export const getBookById = async (id: number) => {
    const response = await fetch(`https://localhost:7224/api/Books/${id}`);
    const data = await response.json();
    return data;
}

export const createBook = async (book: IBook) => {
    const response = await fetch('https://localhost:7224/api/Books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
    const data = await response.json();
    return data;
}

export const updateBook = async (book: IBook) => {
    const response = await fetch(`https://localhost:7224/api/Books/${book.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
    const data = await response.json();
    return data;
}

export const deleteBook = async (id: number) => {
    const response = await fetch(`https://localhost:7224/api/Books/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    return data;
}