
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'

export const fileValidtion = {
  image: ['image/jpeg', 'image/png', 'image/gif'],
  files: ['application/pdf', 'application/json']
}

export const localFileUpload = ({ maxFileSize = 5, validation = [] } = {}) => {
  const storage = multer.memoryStorage()

  const fileFilter = (req, file, cb) => {
    if (validation.includes(file.mimetype))
       cb(null, true)
    else cb(new Error('Invalid format', 
      { cause: { status: 400 } }), false)
  }

  return multer({ fileFilter, storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}

export const processFile = async ({ customPath, file, validation = [] }) => {
  const result = await fileTypeFromBuffer(file.buffer)

  if (!result || !validation.includes(result.mime)) {
    throw new Error('Invalid file format', { cause: { status: 400 } })
  }

  await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
  const finalPath = `assets/${customPath}/${randomUUID()}.${result.ext}`
  await writeFile(resolve(`./${finalPath}`), file.buffer)
  file.finalPath = finalPath
  return file
}

export const processFiles = async ({ customPath, files, validation = [] }) => {
  const assets = []
  for (const file of files) {
    assets.push(await processFile({ customPath, file, validation }))
  }
  return assets
}

export const processFields = async ({ customPath, fields = {}, validation = [] }) => {
  const assets = []
  for (const field of Object.keys(fields)) {
    const files = await processFiles({ customPath, files: fields[field], validation })
    assets.push({ field, files })
  }
  return assets
}

export const processMulterUpload = ({
  multerMiddleware,
  customPath = 'general',
  validation = [],
  isRequired = true
}) => {
  return (req, res, next) => {
    
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err)

      try {
        const hasFiles =
          req.file ||
          (Array.isArray(req.files) && req.files.length) ||
          (req.files && typeof req.files === 'object' && Object.keys(req.files).length)

        if (!hasFiles) {
          if (isRequired) {
            return next(new Error('File is required', { cause: { status: 400 } }))
          }
          return next()
        }

        if (req.file) {
          await processFile({ customPath, file: req.file, validation })
        } else if (Array.isArray(req.files)) {
          await processFiles({ customPath, files: req.files, validation })
        } else {
          await processFields({ customPath, fields: req.files, validation })
        }

        next()
      } catch (error) {
        next(error)
      }
    })
  }
}