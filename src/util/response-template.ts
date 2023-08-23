export const responseArray = (statusCode: number, message: string, total: number, content?) => {
    return {
        statusCode,
        message,
        total,
        content,
        dateTime: new Date().toISOString()
    }
}

export const responseObject = (statusCode: number, message: string, content?) => {
    return {
        statusCode, 
        message, 
        content,
        dateTime: new Date().toISOString()
    }
}