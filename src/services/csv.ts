import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

const createCsvFile = async (header, data, fileName) => {
    const csvWriter = createObjectCsvWriter({
        path: path.join(__dirname, '..', '..', 'reports', fileName),
        header: createHeader(header)
    })
    try {
        await csvWriter.writeRecords(data)
    } catch (err) {
        throw err
    }
}

const createHeader = (titles) => {
    return titles.map(title => {
        return {id: title.toLowerCase().replace(/ /g, "_"), title}
    })
}

export { createCsvFile }