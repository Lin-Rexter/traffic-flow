var methods = ['select', 'update', 'insert', 'upsert', 'delete']

var isInMethods = (method) => methods.includes(method.toLowerCase())

export const CheckError = (client) => {
    if (!client) {
        throw new Error('[Supabase Client]: Supabase client is not initialized !');
    }
    return client
}


export const CheckOptions = (values, options, method) => {
    const method_options = {
        'select': ['count', 'head'],
        'update': ['count'],
        'insert': ['count', 'defaultToNull'],
        'upsert': ['count', 'ignoreDuplicates', 'onConflict', 'defaultToNull'],
        'delete': ['count']
    }

    const return_data = {
        data: [],
        error: null
    }

    // 檢查 values 參數
    if ((!values) && (['update', 'insert', 'upsert'].includes(method))) {
        throw new Error(`[CheckOptions]: ${method}動作缺少values參數`)
    }

    // 檢查是否指定 options 參數
    if ((Object.keys(options).length == 0)) {
        if (method == 'delete') {
            return return_data
        }

        return_data.data.push(values)
        return return_data
    }

    // 檢查 method 是否有效
    if (!(isInMethods(method))) {
        throw new Error('[CheckOptions]: method參數指定錯誤，有效方法: [select, update, insert, upsert, delete]')
    }

    // 檢查 options 參數
    if (!(Object.keys(options).every((option) => method_options[method].includes(option)))) {
        return_data.error = `[${method}]: options參數錯誤, 有效參數: ${method_options[method]}`
        return return_data
    }

    // 檢查 options 參數值
    if (!(Object.values(options).every((option) => [Boolean, Object, String, Number].includes(option.constructor)))) {
        return_data.error = `[${method}]: options參數值錯誤，有效類型: [Boolean, Object, String, Number]`
        return return_data
    }

    // 合併 option 參數 (目前處理完的參數: count, head)
    if (method != 'delete') return_data.data.push(values)
    return_data.data.push({})
    const new_options = return_data.data.at(-1)
    Object.entries(options).map(([key, value], index) => {
        if (key == 'count') {
            // count: true | false | { count: algorithm(exact, planned, estimated) }
            new_options['count'] = (value === true) ? 'exact' : value
        } else if (key == 'head') {
            if (value === true) {
                new_options['head'] = true
            }
        } else {
            if (value !== false) {
                new_options[key] = value
            }
        }
    })

    return return_data
}


// 優先度比 modifier 高
const filter_keywords = [
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in',
    'contains', 'containedBy',
    'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte',
    'rangeAdjacent', 'overlaps', 'textSearch', 'match',
    'not', 'or', 'filter'
]

const modifier_keywords = [
    'select', 'order', 'limit', 'range',
    'abortSignal', 'single', 'maybeSingle',
    'csv', 'returns', 'explain'
]

const Check_Filter_Modifier = (filter_modifier) => {
    if (
        (filter_modifier.constructor.name == 'Object')
        && ((Object.keys(filter_modifier).every(key => (filter_keywords.concat(modifier_keywords).includes(key)))))
    ) {
        return true
    }

    return false
}

/*
Filters過濾器:
    - 可在select()前後
    - 不支援Insert()
*/
export const CheckFilters = ({ query, filter_array = {}, method = null }) => {
    var new_query = query

    // = = = = = = = 檢查 query 查詢物件 = = = = = = =
    if (!new_query) {
        throw new Error('[CheckModifiers]: query無效')
    }

    // = = = = = = = 檢查 method 是否有效 = = = = = = =
    method = method.toLowerCase()
    if (!(isInMethods(method))) {
        throw new Error('[CheckOptions]: method參數指定錯誤，有效方法: [select, update, insert, upsert, delete]')
    }

    // = = = = = = = 檢查 method 是否支援 (未指定 Filters 參數)  = = = = = = =
    if (Object.keys(filter_array).length == 0) {
        if (['delete', 'update'].includes(method)) {
            throw new Error(`[CheckFilters]: '${method}'動作請指定Filters過濾器`)
        }

        return new_query
    }

    // = = = = = = = 檢查 method 是否支援和 Filters 參數 (已指定 Filters 參數) = = = = = = =
    if (['insert', 'upsert'].includes(method)) {
        throw new Error(`[CheckFilters]: '${method}'動作不支援Filters過濾器`)
    }

    if (!(Check_Filter_Modifier(filter_array))) {
        throw new Error('[CheckFilters]: Filters參數錯誤')
    }

    // = = = = = = = 合併Filters = = = = = = = =
    Object.entries(filter_array).map(([key, value], index) => {
        if (value && (value.constructor.name == "Array")) {
            new_query = query[key](...value)
        }
    })

    return new_query
}

/*
Modifiers修改器:
    - 必須在Filters過濾器後面
    - 必須在select()後面
*/
// 除了select動作外，預設返回資料(select())
export const CheckModifiers = ({ query, modifier_array = {}, method = null }) => {
    var new_query = query

    // = = = = = = = 檢查 query 查詢物件 = = = = = = =
    if (!new_query) {
        throw new Error('[CheckModifiers]: query無效')
    }

    // = = = = = = = 檢查 method 是否有效或支援 = = = = = = =
    method = method.toLowerCase()
    if (!(isInMethods(method))) {
        throw new Error('[CheckOptions]: method參數指定錯誤，有效方法: [select, update, insert, upsert, delete]')
    }

    // = = = = = = = 處理未指定 Modifiers 參數狀況 = = = = = = =
    if ((Object.keys(modifier_array).length == 0)) {
        return (method != 'select') ? new_query.select() : new_query
    }

    // = = = = = = = 檢查 Modifiers 參數 (已指定 Modifiers 參數) = = = = = = =
    if (!(Check_Filter_Modifier(modifier_array))) {
        throw new Error('[CheckModifiers]: Modifiers參數錯誤')
    }

    // = = = = = = = 合併 Modifiers = = = = = = = =
    // 除了select動作外，預設返回資料
    if (method != 'select') {
        new_query = new_query.select()
    }
    Object.entries(modifier_array).map(([key, value], index) => {
        //console.log('key: ', key)
        //console.log('value: ', value)
        if ((value !== null)) {
            if ((value.constructor === Boolean)) {
                if (value === true) {
                    new_query = new_query[key]()
                }
            }

            if ((value.constructor === Array)) {
                if (value.length > 0) {
                    new_query = query[key](...value)
                } else {
                    new_query = query[key](value)
                }
            }
        }
    })

    //console.log('new_query: ', new_query)

    return new_query
}