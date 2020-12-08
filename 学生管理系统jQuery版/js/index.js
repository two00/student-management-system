var nowPage = 1;
var pageSize = 1;
var tableData = [];
var allPage = 1;
function bindEvent() {
    $('.menu').on('click', 'dd', function() {
        $(this).addClass('active').siblings().removeClass('active');
        var id = $(this).data('id')
        $('#' + id).fadeIn().siblings().fadeOut()
    });

    $('#student-add-submit').click(function (e) {
        e.preventDefault();
        var data = formatData($('#student-add-form').serializeArray());
        if (data) {
            transferData('/api/student/addStudent', data, function () {
                alert('新增成功');
                $('.menu > dd[data-id="student-list"]').click();
                getTableData()
            })
        }
    });
    $('#tBody').on('click', '.edit', function () {
        var index = $(this).parents('tr').index();
        var student = tableData[index];
        renderModal(student)
        $('.modal').slideDown()
    });
    $('#student-edit-submit').click(function (e) {
        e.preventDefault();
        var data = formatData($('#student-edit-form').serializeArray());
        if (data) {
            transferData('/api/student/updateStudent', data, function () {
                alert('修改成功');
                $('.modal').slideUp();
                getTableData()
            })
        }
    });
    $('.modal').click(function () {
        $(this).slideUp()
    })
    $('.modal-content').click(function (e) {
        // 阻止冒泡
       e.stopPropagation()
    });
    $('#tBody').on('click', '.del', function () {
        var index = $(this).parents('tr').index();
        var student = tableData[index];
        var isDel = confirm('确认删除？');
        if (isDel) {
            transferData('/api/student/delBySno', {
                sNo: student.sNo
            }, function () {
                alert('删除成功');
                getTableData()
            })
        }
    });

    $('#search-btn').click(function () {
        var val = $('#search-inp').val();
        nowPage = 1;
        if (val) {
            searchData(val)
        } else {
            getTableData()
        }
    });
    // 搜索框点击回车的时候过滤数据
    $('#search-inp').on('keydown', function (e) {
        if (e.keyCode == 13) {
            $('#search-btn').trigger('click');
        }
    })
}

// 检索表格数据
function searchData(val) {
   
    transferData('/api/student/searchStudent', {
        sex: $('#search-sex').val(),
        search: val,
        page: nowPage,
        size: pageSize
    }, function (data) {
        // 重新渲染表格数据
        allPage = Math.ceil(data.cont / pageSize);
        tableData = data.searchList;
        renderTable(data.searchList);
    })
}

function renderModal(data) {
    console.log($('#student-edit-form'))
    var form = $('#student-edit-form')[0];
    
    for (var prop in data) {
        console.log(prop, form[prop])
        if (form[prop]) {
            form[prop].value = data[prop]
        }
    }
}

function transferData(url, data, cb) {
    $.ajax({
        type: 'get',
        url: 'http://open.duyiedu.com' + url,
        data: $.extend({
            appkey: 'qiqiqi_1569759019786'
        }, data),
        // 在jsonp请求当中一般我们不会使用success   因为jsonp中已经传递了一个接受数据的函数了
        // 希望拿取到的数据是json对象的格式
        dataType: 'json',
        success: function (res) {
            // console.log(res)
            if(res.status == 'success') {
                cb(res.data);
            } else {
                alert(res.msg)
            }
        }   
    })
}

function formatData(data) {
    var result = {}
    for (var i = 0; i < data.length; i++) {
        if (!data[i].value) {
            alert('信息填写不全，请检查之后再提交')
            return false;
        }
        result[data[i].name] = data[i].value;
    }
    return result;
}


function getTableData() {
    transferData('/api/student/findByPage', {
        page: nowPage,
        size: pageSize
    }, function (data) {
        console.log(data)
        allPage = Math.ceil(data.cont / pageSize);
        renderTable(data.findByPage);
        tableData = data.findByPage;
    })
}

function renderTable(data) {
    var str = '';
    data.forEach(function(item) {
        str += ` <tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男' :'女'}</td>
        <td>${item.email}</td>
        <td>${new Date().getFullYear() - item.birth}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="edit btn">编辑</button>
            <button class="del btn">删除</button>
        </td>
    </tr>`
    });
    $('#tBody').html(str)
    $('.turn-page').page({
        nowPage: nowPage,
        allPage: allPage,
        changePage: function (page) {
            nowPage = page;
            var val = $('#search-inp').val();
            if (val) {
                searchData(val);
            } else {
                getTableData()
            }
        }
    })
}

bindEvent()
getTableData();