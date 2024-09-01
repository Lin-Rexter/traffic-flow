import { Supabase_CRUD } from '@/lib/supabase/client'


// 測試CRUD
/**
 *  @param {string} test_type - 測試類型
 *  @example
 *  const result = await CRUD_Test('insert')
 *  console.log(result)
 *  @description
 *  - 類型:
 *      - insert
 *      - read
 *      - update
 *      - upsert
 *      - delete
 */
export async function CRUD_Test(test_type) {
    try {
        const Supabase = new Supabase_CRUD('Live_Data')
        var Result = null

        // 測試資料
        const columns = [
            {
                section_id: '0000',
                level: '2',
                update_time: '2024-08-05 04:00:00+00',
                update_interval: 60,
                travel_time: 55,
                travel_speed: 68
            }, {
                section_id: '0001',
                level: '2',
                update_time: '2024-08-05 04:00:00+00',
                update_interval: 60,
                travel_time: 55,
                travel_speed: 68
            }
        ]

        // Result: {data, error}
        // [C] - Create
        if (test_type == 'insert') {
            Result = await Supabase.insert({
                values: columns,
                options: { count: true },
                modifiers: { csv: false }
            })
        }


        // [R] - Read
        if (test_type == 'read') {
            Result = await Supabase.read({
                columns: 'level',
                options: { count: true, head: false },
                filters: { eq: ["section_id", "0001"] },
                modifiers: { csv: false }
            })
        }


        // [U] - Update
        if (test_type == 'update') {
            Result = await Supabase.update({
                values: { level: 30 },
                options: { count: true },
                filters: { eq: ["section_id", "0001"] },
            })
        }


        // [UI] - Update with Insert (符合條件則更新，否則插入)
        if (test_type == 'upsert') {
            Result = await Supabase.upsert({
                values: { id: 614, level: 30, update_interval: 70 },
                options: { count: true } // onConflict
            })
        }


        // [D] - Delete
        if (test_type == 'delete') {
            Result = await Supabase.delete({
                options: { count: true },
                filters: { eq: ["section_id", "0001"] },
            })
        }

        return Result
    } catch (e) {
        console.error('[CRUD Test] ERROR: ', e)
        return { error: e }
    }
}