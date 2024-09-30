'use client'
import { createClient_withoutSSR } from '@/lib/supabase/server_without_SSR'
import { CheckError, CheckOptions, CheckFilters, CheckModifiers } from './check';
import { has } from '@/lib/utils'

// = = = = = = = = = = = = = = = = = = =
// Supabase CRUD Methods
// = = = = = = = = = = = = = = = = = = =
export class Supabase_CRUD {
    constructor(table = null, Url_and_Key = null) {
        if (Url_and_Key) {
            const { supabaseUrl, supabaseKey } = Url_and_Key
            this.client = createClient_withoutSSR(supabaseUrl, supabaseKey);
        } else {
            this.client = createClient_withoutSSR();
        }
        this.table = table;
    }

    async db({ new_client = null, new_table = null }) {
        const client = await CheckError(new_client ?? this.client)
        return await client.from(new_table ?? this.table);
    }

    async response({ data = null, error = null }) {
        error && console.error(error);

        if (has(data, 'data') || has(data, 'error') || has(data, 'count')) {
            return { ...data }
        }

        return { data: data, error: error };
    }

    // [R] - Read [建置完成 ✅]
    async read({ table = null, columns = '*', options = {}, filters = {}, modifiers = {} }) {
        try {
            var table_query = await this.db({ new_table: table })

            // 檢查參數
            const { data, error } = CheckOptions(columns, options, 'select')
            if (error) {
                return await this.response({ error: error })
            }
            //console.log(data)

            table_query = table_query.select(...data)

            // 檢查過濾器
            table_query = CheckFilters({
                query: table_query,
                filter_array: filters,
                method: 'select'
            })

            // 檢查修改器
            let Result = CheckModifiers({
                query: table_query,
                modifier_array: modifiers,
                method: 'select'
            })
            //console.log(result)

            // 轉換成 Array 格式
            Result = await Result
            //Result = Object.keys(Result).map((key) => Result[key])

            return await this.response({ data: Result });
        } catch (e) {
            console.error(e);
            return await this.response({ error: e.message });
        }
    }

    // [C] - Create [建置完成 ✅]
    async insert({ table = null, values, options = {}, modifiers = {} }) {
        try {
            var table_query = await this.db({ new_table: table })

            // 檢查參數
            const { data, error } = CheckOptions(values, options, 'insert')
            if (error) {
                return await this.response({ error: error })
            }

            table_query = table_query.insert(...data)

            // 檢查修改器
            const result = CheckModifiers({
                query: table_query,
                modifier_array: modifiers,
                method: 'insert'
            })
            //console.log(result)

            return await this.response({ data: await result });
        } catch (e) {
            console.error(e);
            return await this.response({ error: e.message });
        }
    }

    // [U] - Update [建置完成 ✅]
    async update({ table = null, values, options = {}, filters = {}, modifiers = {} }) {
        try {
            var table_query = await this.db({ new_table: table })

            // 檢查參數
            const { data, error } = CheckOptions(values, options, 'update')
            if (error) {
                return await this.response({ error: error })
            }

            table_query = table_query.update(...data)

            // 檢查過濾器
            table_query = CheckFilters({
                query: table_query,
                filter_array: filters,
                method: 'update'
            })

            // 檢查修改器
            const result = CheckModifiers({
                query: table_query,
                modifier_array: modifiers,
                method: 'update'
            })
            //console.log(result)

            return await this.response({ data: await result });
        } catch (e) {
            console.error(e);
            return await this.response({ error: e.message });
        }
    }

    // [UI] - Update with Insert (符合條件則更新，否則插入) [建置完成 ✅]
    // data: 必須包含id
    async upsert({ table = null, values, options = {}, modifiers = {} }) {
        try {
            var table_query = await this.db({ new_table: table })

            // 檢查參數
            const { data, error } = CheckOptions(values, options, 'upsert')
            if (error) {
                return await this.response({ error: error })
            }

            //console.log(data)

            table_query = table_query.upsert(...data)

            // 檢查修改器
            const result = CheckModifiers({
                query: table_query,
                modifier_array: modifiers,
                method: 'upsert'
            })
            //console.log(result)

            return await this.response({ data: await result });
        } catch (e) {
            console.error(e);
            return await this.response({ error: e.message });
        }
    }

    // [D] - Delete [建置完成 ✅]
    async delete({ table = null, options = {}, filters = {}, modifiers = {} }) {
        try {
            var table_query = await this.db({ new_table: table })

            // 檢查參數
            const { data, error } = CheckOptions(null, options, 'delete')
            if (error) {
                return await this.response({ error: error })
            }

            table_query = (data.length > 0) ? table_query.delete(...data) : table_query.delete()

            // 檢查過濾器
            table_query = CheckFilters({
                query: table_query,
                filter_array: filters,
                method: 'delete'
            })

            // 檢查修改器
            const result = CheckModifiers({
                query: table_query,
                modifier_array: modifiers,
                method: 'delete'
            })
            //console.log(result)

            return await this.response({ data: await result });
        } catch (e) {
            console.error(e);
            return await this.response({ error: e.message });
        }
    }

    // Count Data [建置完成 ✅]
    async count({ table = null, algorithm = 'exact' }) {
        const result = await this.db({ new_table: table })
            .select('*', { count: algorithm, head: true })

        return await this.response({ data: result });
    }
}