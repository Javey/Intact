<template>
    <table>
        <thead>
            <tr>
                <th title="First Name">
                    <div class="k-table-title">
                        <div class="k-table-title-text c-ellipsis">First Name</div>
                    </div>
                </th>
                <th title="Last Name">
                    <div class="k-table-title">
                        <div class="k-table-title-text c-ellipsis">Last Name</div>
                    </div>
                </th>
                <th title="Age">
                    <div class="k-table-title">
                        <div class="k-table-title-text c-ellipsis">Age</div>
                    </div>
                </th>
                <th title="Address">
                    <div class="k-table-title">
                        <div class="k-table-title-text c-ellipsis">Address</div>
                    </div>
                </th>
                <th title="Action">
                    <div class="k-table-title">
                        <div class="k-table-title-text c-ellipsis">Action</div>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="$value in data" :key="$value.key">
                <td><slot name="first-name" :value="$value"></slot></td>
                <td><slot name="last-name" :value="$value"></slot></td>
                <td><slot name="age" :value="$value"></slot></td>
                <td><slot name="address" :value="$value"></slot></td>
                <td><slot name="action" :value="$value"></slot></td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    props: {
        data: Array
    }
});
</script>
