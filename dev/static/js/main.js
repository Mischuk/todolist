$(function() {
    $('a[href="#"]').click(function(e){
      e.preventDefault();
    });

    var $task = $(".task"),
        $toolbar = $('.toolbar'),
        $form = $('.todolist__form'),
        SHOW_ALL_PROJECTS = 'all';

    // Переключение описания
    $('body').on('click', '.js-toggle', function(){
      var $this = $(this);
      $this.parents('.menu').prev().slideToggle();
      $this.text(function(i, text){
        return text === 'Свернуть' ? 'Развернуть' : 'Свернуть';
      });
    });

    // Приоритет
    function sort_tasks() {
      if ( $('.js-priority').is(':checked') ) {
        var sorted = $(".tasks .task").sort(sort_priority);
        $(".tasks").append(sorted);

        function sort_priority(a, b) {
          return ($(b).data('priority')) < ($(a).data('priority')) ? 1 : -1;
        }
      } else {
        var sorted_reverse = $(".tasks .task").sort(sort_priority_reverse);
        $(".tasks").append(sorted_reverse);
        function sort_priority_reverse(a, b) {
          return ($(b).data('id')) < ($(a).data('id')) ? 1 : -1;
        }
      }
    }
    $(document).on('click', '.js-priority', function() {
      sort_tasks();
    });

    // Проекты
    function parse_projects() {
      var task_projects = [];
      $('.task').each(function(){
        var task_project = $(this).attr('data-project');
        if (task_projects.indexOf(task_project) == -1) {
          task_projects.push(task_project);
        }
      });
      $('.js-project').append('<option value="'+SHOW_ALL_PROJECTS+'">Все</option>');
      for ( var i = 0, l = task_projects.length; i < l; i++ ) {
        $('.js-project').append('<option value="'+task_projects[i]+'">'+task_projects[i]+'</option>');
      }
    }
    parse_projects();

    function toggle_task_by_project() {
      if ( $('.js-project').val() !== SHOW_ALL_PROJECTS ) {
        $('.task').each(function(){
          if ($(this).data('project') !== $('.js-project').val() ) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      } else {
        $('.task').show();
      }
    }

    $('.js-project').on('change', function(){
      toggle_task_by_project();
    });


    // Удаление
    $('body').on('click', '.js-close', function(){
      $(this).parents('.task').remove();
    });

    // Переключение формы
    function form_open() {
      $toolbar.fadeOut('500', function(){
        $form.fadeIn(500);
      });
    }

    function form_close() {
      $form.fadeOut('500', function(){
        $toolbar.fadeIn(500);
        $('.js-form-add, .js-form-save').hide();
      });
    }

    function form_clear() {
      $('.form')[0].reset();
    }

    function update_dom_elems() {
      $elems = $(".tasks .task").clone();
      $(".tasks .task").remove();
      $(".tasks").append($elems);
    }

    // Добавление
    $('.js-add').on('click', function(){
      form_open();
      $('.js-form-add').show();
      $('.js-form-save').hide();
    });

    function check_exist_project() {
      $('.task').each(function(){
        var project_exist = $(this).attr('data-project');
        if($('.js-project option[value="'+($('#js-task-project').val())+'"]').length == 0) {
          $('.js-project').append('<option value="'+$('#js-task-project').val()+'">'+$('#js-task-project').val()+'</option>');
        }
      });
    }


    $('.required').on('focus', function() {
      $(this).removeClass('error');
    });


    $('.js-form-add').on('click', function() {
      var form_errors = 0;
      $('.required').each(function(){
        if ( !$(this).val() ) {
          $(this).addClass('error');
          form_errors++;
        }
      });
      if (form_errors > 0) { return false }

      var new_task =
        '<div class="tasks__item task" data-priority="'+$('#js-task-priority').val()+'" data-id="'+($('.task').length+1)+'" data-project="'+$('#js-task-project').val()+'">'+
          '<div class="task__title">'+$('#js-task-title').val()+'</div>'+
          '<div class="task__details"><div class="task__project">Проект: '+$('#js-task-project').val()+'</div><div class="task__priority">Приоритет: '+$('#js-task-priority').val()+'</div></div>'+
          '<div class="task__description">'+$('#js-task-description').val()+'</div>'+
          '<div class="task__menu menu"><div class="menu__item"><button class="button button_task button_left js-change" type="button">Изменить</button></div><div class="menu__item"><button class="button button_task button_center js-close" type="button">Закрыть</button></div><div class="menu__item"><button class="button button_task button_right js-toggle" type="button">Развернуть</button></div></div>'+
        '</div>'
      $('.tasks').append(new_task);
      sort_tasks();
      form_close();
      check_exist_project();
      toggle_task_by_project();
      form_clear();
    });

    // Редактирование
    $('body').on('click', '.js-change', function(){
      form_open();
      $('.js-form-add').hide();
      $('.js-form-save').show();

      var $current_task = $(this).parents('.task');

      $('.form').attr('data-current-id', $current_task.attr('data-id'));
      $('#js-task-title').val($current_task.find('.task__title').text());
      $('#js-task-project').val($current_task.attr('data-project'));
      $('#js-task-priority').val($current_task.attr('data-priority'));
      $('#js-task-description').val($current_task.find('.task__description').text());
    });

    $('.js-form-save').on('click', function(){
      var form_errors = 0;
      $('.required').each(function(){
        if ( !$(this).val() ) {
          $(this).addClass('error');
          form_errors++;
        }
      });
      if (form_errors > 0) { return false }


      var $current_task_id = $(this).parents('.form').attr('data-current-id');
      var $current_task_el = $('*[data-id="'+$current_task_id+'"]');
      $current_task_el.find('.task__title').text($('#js-task-title').val());
      $current_task_el.find('.task__description').text($('#js-task-description').val());

      $current_task_el.find('.task__project').text('Проект: ' + $('#js-task-project').val());
      $current_task_el.attr('data-project', $('#js-task-project').val());

      $current_task_el.find('.task__priority').text('Приоритет: ' + $('#js-task-priority').val());
      $current_task_el.attr('data-priority', $('#js-task-priority').val());

      update_dom_elems();
      sort_tasks();
      form_close();
      check_exist_project();
      toggle_task_by_project();
      form_clear();
    });


    // Закрытие формы
    $('.js-form-reset').on('click', function(){
      form_close();
    });
});