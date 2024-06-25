import { Component, OnInit } from '@angular/core';
import {TarefaService} from "../../app-core/servicos/tarefa-service.service";
import {Tarefa} from "../../app-core/model/tarefa";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
declare var $ : any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visualizar-tarefas',
  templateUrl: './visualizar-tarefas.component.html',
  styleUrls: ['./visualizar-tarefas.component.css']
})
export class VisualizarTarefasComponent implements OnInit {

  i: number =0;
  tarefas: any[] = [];
  tarefaVisualizar: any;
  form: FormGroup;
  constructor(private tarefaService: TarefaService,
              private fb: FormBuilder) {

    this.form = this.fb.group({
      tituloTarefa: ['', Validators.required],
      dataInicioTarefa: ['', Validators.required],
      dataConclusaoTarefa: ['', Validators.required],
      statusTarefa: ['', Validators.required],
      descricaoTarefa: ['', Validators.required],
      id: [0]
    });
  }

    openModal(){
    $('#add-tarefa').modal('show');
  }
  closeModal(){
    $('#add-tarefa').modal('hide');
  }

  salvarFormTarefa() {
    if(this.form.valid){
     const novaTarefa: Tarefa = new Tarefa(
       this.form.value.tituloTarefa,
       this.form.value.dataInicioTarefa,
       this.form.value.dataConclusaoTarefa,
       this.form.value.descricaoTarefa,
       this.form.value.statusTarefa
     );
     console.log('dados da nova tarefa', novaTarefa)
      this.tarefaService.adicionarTarefas(novaTarefa).then(resposta =>{
        if (resposta > 0) {
          Swal.fire('Sucesso', 'Tarefa salva com sucesso!', 'success');
          this.form.reset();
          this.closeModal();
          this.listarTarefas();
        }
      }).catch (respostaError => {
        Swal.fire('Não foi dessa vez', 'Não foi possível salvar a tarefa, ' +
          'tente novamente mais tarde', 'error');
        console.log(respostaError);
      })
    }else{
      console.log("CAMPOS INVALIDOS ENCONTRADOS.");
      console.log("DADOS DOS CAMPOS: ", this.form.value);
      Swal.fire('Cuidado', 'Alguns campos do formulário não estão ' +
        'corretos.', 'warning');
      this.marcarTodosComoClicados();
    }
  }

  isCampoValido(inputNome: string) : boolean {
    const campo: any = this.form.get(inputNome);
    return campo && campo.touched && campo.invalid;
  }
  marcarTodosComoClicados(){
    Object.values(this.form.controls).forEach(campo => {
      campo.markAsTouched();
    });
  }

  listarTarefas() {
    this.tarefaService.buscarTarefas().then(resposta  => {
      this.tarefas = resposta;
    })
  }

  setTarefaAtual(tarefa: Tarefa){
    this.tarefaVisualizar= tarefa;
  }

  excluirTarefa(id: number){
    Swal.fire(
      {
        title:'Tem certeza?',
        text:'Você não poderá reverter isso!',
        icon: 'warning',
        showCancelButton:true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar tarefa!',
        confirmButtonColor: '#3085d6'
      }).then((tipoBotao) =>{
        if(tipoBotao.isConfirmed){
          this.tarefaService.removerTarefa(id).then(() => {
            Swal.fire('Deletado!', "A tarefa foi deletada.", "success");
            this.listarTarefas();
          })
        }
    }).catch(error => {
      console.log(error);
      Swal.fire('ERRO!', "A tarefa não foi deletada.", "error")
    });

  }

  submitForm(){
    if(this.form.value.id > 0){
      this.editarFormTarefa();
    }else{
      this.salvarFormTarefa();
    }
  }

  carregarDadosTarefa(tarefaEditar: Tarefa){

    this.form.patchValue( {
      tituloTarefa: tarefaEditar.titulo,
      dataInicioTarefa: tarefaEditar.dataInicio,
      dataConclusaoTarefa: tarefaEditar.dataConclusao,
      statusTarefa: tarefaEditar.status,
      descricaoTarefa: tarefaEditar.descricao,
      id: tarefaEditar.id
    });
    this.openModal();
  }

  editarFormTarefa(){
    if(this.form.valid) {
      const editarTarefa: Tarefa = new Tarefa(
        this.form.value.tituloTarefa,
        this.form.value.dataInicioTarefa,
        this.form.value.dataConclusaoTarefa,
        this.form.value.descricaoTarefa,
        this.form.value.statusTarefa,
        this.form.value.id
      );
      this.tarefaService.atualizarTarefa(this.form.value.id, editarTarefa)
        .then(resposta => {
          if (resposta === 1) {
            Swal.fire('Sucesso!', 'Tarefa editada com sucesso.', 'success');
            this.form.reset();
            this.closeModal();
            this.listarTarefas();
          }else{
            Swal.fire('Atenção', 'Nenhuma tarefa encontrada, ou nenhuma alteração ' +
              'necessaria', 'info')
          }
        }).catch(error => {
        Swal.fire('Cuidado!', 'Não foi possível editar a tarefa!', 'error')
      });
    }else{
      Swal.fire('Cuidado!', 'Alguns campos estão incorretos', 'warning');
      this.marcarTodosComoClicados();
    }
  }

  ngOnInit(): void {
    this.listarTarefas();
  }

}
