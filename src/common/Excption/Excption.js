

export const ApplicationExption = (message = "error", options = { status: 400 }) => {
    throw new Error(message, { cause: options })
}

export const BadRequestExption = (message = "BadRequest", extra = {}) => {
    return ApplicationExption(message, {
        status: 400,
        ...extra
    })
}
export const ConflictExption=(message ="Conflict" , extra={})=>{
    return ApplicationExption(message, {
        status:409, ...extra
    })

}
export const Forbidden=(message ="Forbidden" , extra={})=>{
    return ApplicationExption(
        message,
        {
            status:403,
            ...extra
        }
    )

}

export const NotFoundExption=(message="NotFound" , extra={})=>{
return ApplicationExption(
    message,
    {
        status:404,
        ...extra
    }
)

}

export const UnauthorizedExption=(message="Unauthorized" , extra={} )=>{
    return ApplicationExption(
        message,
        {
            status:401,
            ...extra
        }
    )

}
